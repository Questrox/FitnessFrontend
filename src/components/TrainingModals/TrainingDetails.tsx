import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Stack,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Tab,
  Tabs,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { ClientDTO, CoachDTO, CreateTrainingReservationDTO, ReservationForTrainingDTO, TrainingDTO } from "../../api/g";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { apiClient } from "../../api/apiClient";
import { ClientSelectDialog } from "./ClientSelectDialog";
import { TrainingAttendanceList } from "./TrainingAttendanceList";
import { useConfirm } from "material-ui-confirm";
import { CoachSelectDialog } from "./CoachSelectDialog";

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  training: TrainingDTO | null;
  setTraining: React.Dispatch<React.SetStateAction<TrainingDTO | null>>;
  refreshTrainingList: () => Promise<void>
  onCancelOrCompleteTraining: (startDate: Date) => Promise<void>;
}

export function TrainingDetails({ isOpen, onClose, training, setTraining, refreshTrainingList, onCancelOrCompleteTraining }: TrainingModalProps) {
  const theme = useTheme();
  const confirm = useConfirm();
  const [tab, setTab] = useState<"details" | "attendance">("details");

  const { userRole, user } = useAuth();
  const [message, setMessage] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"details" | "selectClient" | "selectCoach">("details");
  const [selectedClient, setSelectedClient] = useState<ClientDTO | null>(null);
  
  const [reservations, setReservations] = useState<ReservationForTrainingDTO[] | null>(null);

  const canBook = message === "";
  const canCancel = (userRole === "Admin" || training?.coach?.userId === user?.userId && training?.trainingType?.maxClients === 1) && training?.trainingStatusId === 1;

  useEffect(() => {
    if (!isOpen) {
      setTab("details");
      setMessage("");
      setCancelError("");
      setIsLoading(true);
      setSelectedClient(null);
      setReservations(null);
    }
    if (isOpen && (userRole === "Admin" || userRole === "Coach")) {
      fetchReservations();
    }
  }, [isOpen]);

  const fetchReservations = async () => {
    try {
      const res = await apiClient.getReservationsByTrainingId(training!.id!);
      setReservations(res);
    } catch (error: any) {
      console.error("Ошибка при загрузке записей: ", error.message);
    }
  }

  useEffect(() => {
    if (!training || !isOpen) return;
    if (userRole === "Admin" && selectedClient === null) return;
    if (training.trainingStatusId === 3) return;
    if (userRole === "Coach") return;

    checkReservationCreation();
  }, [training, isOpen, selectedClient]);

  const checkReservationCreation = async () => {
    console.log(selectedClient)
    if (isFull)
    {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      if (userRole === "Admin") // Если админ записывает клиента
      {
        const result = await apiClient.checkReservationPossibility(
          training!.id,
          selectedClient!.id
        );
        setMessage(result);
      }
      else // Если клиент записывается сам
      {
        const result = await apiClient.checkReservationPossibility(
          training!.id,
          undefined
        );
        setMessage(result);
      }
    } catch (error) {
      console.error("Ошибка при проверке возможности записи", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCoachSelect = async (coach: CoachDTO) => {
    try {
      const data = await apiClient.updateTrainingCoach(training?.id, coach.id);
      setTraining(data);
      setView("details");
      await refreshTrainingList();
    } catch (error: any) {
      alert(error.message);
    }
  }

  const handleCancel = async () => {
    const {confirmed} = await confirm({description: "Вы действительно хотите отменить эту тренировку?"})
    if (confirmed) {
      try {
        const result = await apiClient.cancelTraining(training!.id!);
        setTraining(result);
        setCancelError("");
        await onCancelOrCompleteTraining(result!.startDate!);
      } catch (error: any)
      {
        const message = error.message.split(": ")[1];
        setCancelError(message);
      }
    }
  }
  const getPlacesText = (count: number): string => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return `${count} мест`;
    }
    if (lastDigit === 1) {
      return `${count} место`;
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
      return `${count} места`;
    }
    return `${count} мест`;
  };

  if (!training) return null;

  const trainingType = training.trainingType;
  const coach = training.coach;

  if (!trainingType || !coach) return null;

  const spotsLeft =
    trainingType.maxClients! - (training.reservationsCount || 0);

  const isFull = spotsLeft <= 0;

  const start = new Date(training.startDate!);
  const end = new Date(training.endDate!);

  const timeLabel = `${start.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${end.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  const bonuses =
    ((trainingType.price || 0) / 100) *
    (trainingType.cashbackPercentage || 0);

  const handleCreateReservation = async () => {
    try
    {
      const dto = new CreateTrainingReservationDTO();
      dto.trainingId = training.id;
      if (userRole === "User")
        dto.clientId = undefined;
      else
        dto.clientId = selectedClient!.id;
      const result = await apiClient.addReservation(dto);
      console.log(training);
      training.reservationsCount = (training.reservationsCount ?? 0) + 1;
      await checkReservationCreation();
      await refreshTrainingList();
      if (reservations)
      {
        await fetchReservations();
      }
    }
    catch (error: any)
    {
      setMessage(error.message);
    }
  }

  const onConfirmAttendance = async (resId: number) => {
    const {confirmed} = await confirm({description: "Вы действительно хотите отметить посещение этого клиента?"})
    if (confirmed)
    {
      try {
        const result = await apiClient.confirmTrainingAttendance(resId);
        const updatedReservations = reservations!.map(res => res.id === resId ? result : res);
        setReservations(updatedReservations);
        console.log(result);
      } catch (error: any) {
        alert(error.message);
      }
    }
  }

  const onMarkCompleted = async () => {
    const {confirmed} = await confirm({description: "Вы уверены, что отметили всех клиентов?"})
    if (confirmed)
    {
      try {
        const result = await apiClient.completeTraining(training.id!);
        setTraining(result);
        await onCancelOrCompleteTraining(result.startDate!);
      } catch (error: any) {
        alert(error);
      }
    }
  }

  return (
    <>
    <Dialog open={isOpen && view === "details"} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>
        {trainingType.name}
      </DialogTitle>
      {(userRole === "Coach" || userRole === "Admin") && (
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ px: 3 }}
      >
        <Tab label="Информация" value="details" />
        <Tab label="Клиенты" value="attendance" />
      </Tabs>
    )}

      <DialogContent>
        {tab === "details" && (
        <Stack spacing={3}>
          {/* Основная информация */}
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Время</Typography>
              <Typography fontWeight={600}>{timeLabel}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Тренер</Typography>
              <Typography fontWeight={600}>
                {coach.user?.fullName}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Заполненность</Typography>
              <Typography fontWeight={600}>
                {training.reservationsCount || 0} /{" "}
                {trainingType.maxClients}
              </Typography>
            </Stack>

            <Divider />

            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight={600}>Цена</Typography>
              <Typography variant="h6" fontWeight={700}>
                {trainingType.price! > 0
                  ? `${trainingType.price} ₽`
                  : "Бесплатно"}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Будет начислено бонусов</Typography>
              <Typography fontWeight={600}>
                {bonuses.toFixed(2)}
              </Typography>
            </Stack>
          </Stack>

          {/* Доступность */}
          {isFull || training?.trainingStatusId === 3 ? (
            <Box
                sx={{
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: "error.main",
                p: 2,
                borderRadius: 2,
                textAlign: "center",
                fontWeight: 600,
                }}
            >
                {training?.trainingStatusId === 3 ? "Тренировка отменена" : "Нет свободных мест"}
            </Box>
            ) : training.trainingStatusId === 2 ? (
                <Box
                  sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: "success.main",
                  p: 2,
                  borderRadius: 2,
                  textAlign: "center",
                  fontWeight: 600,
                  }}
                >Тренировка уже проведена</Box>
            ) : (
            <Box
                sx={{
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: "success.main",
                p: 2,
                borderRadius: 2,
                textAlign: "center",
                fontWeight: 600,
                }}
            >
                Осталось {getPlacesText(spotsLeft)}
            </Box>
          )}

          {!canBook && !isLoading && (
            <Typography
              variant="body2"
              color={
                message.includes("Вы уже записаны") || message.includes("Клиент уже записан")
                  ? "success" 
                  : "error"
              }
              textAlign="center"
              fontWeight="bold"
            >
              {message}
            </Typography>
          )}
          {cancelError && (
            <Typography
              variant="body2"
              textAlign="center"
              fontWeight="bold"
              color="error"
            >
              {cancelError}
            </Typography>
          )}

          {userRole === "Admin" && training?.trainingStatusId === 1 && (
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setView("selectClient")}
                disabled={isFull}
              >
                {selectedClient
                  ? `Клиент: ${selectedClient.user?.fullName}`
                  : "Выбрать клиента"}
              </Button>
            )}

            {userRole === "Admin" && training?.trainingStatusId === 1 && (
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setView("selectCoach")}
              >
                Сменить тренера
              </Button>
            )}

            {canCancel && (
              <Button
                fullWidth
                variant="outlined"
                onClick={handleCancel}
                color="error"
              >
                Отменить тренировку
              </Button>
            )}

          {/* Кнопки */}
          <Stack direction="row" spacing={2}>
            {(userRole === "User" || (userRole === "Admin" && selectedClient !== null)) &&
             <Button
              fullWidth
              variant="contained"
              disabled={isLoading || !canBook || isFull}
              onClick={() => {handleCreateReservation()}}
            >
              {isLoading ? (
              <CircularProgress size={24} color="inherit" />
              ) : (
                userRole === "User" ? "Записаться" : "Записать клиента"
              )}
              </Button>
            }
            <Button fullWidth variant="outlined" onClick={onClose}>
              Назад
            </Button>
          </Stack>
        </Stack>
      )}
      {tab === "attendance" && (userRole === "Coach" || userRole === "Admin") && (
      <TrainingAttendanceList
        training={training}
        reservations={reservations}
        onConfirmAttendance={onConfirmAttendance}
        onMarkCompleted={onMarkCompleted}
      />
      )}
      </DialogContent>
    </Dialog>
    <ClientSelectDialog
      open={isOpen && view === "selectClient"}
      onClose={() => setView("details")}
      onSelect={(client) => {
        setSelectedClient(client);
        setView("details");
      }}
    />
    <CoachSelectDialog
      open={isOpen && view === "selectCoach"}
      training={training}
      onClose={() => setView("details")}
      onSelect={handleCoachSelect}
    />
    </>
  );
}