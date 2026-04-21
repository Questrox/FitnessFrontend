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
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { ClientDTO, CreateTrainingReservationDTO, TrainingDTO } from "../../api/g";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { apiClient } from "../../api/apiClient";
import { ClientSelectDialog } from "./ClientSelectDialog";

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  training: TrainingDTO | null;
  setTraining: React.Dispatch<React.SetStateAction<TrainingDTO | null>>;
  onCreateReservationSuccess: () => Promise<void>
  onCancelTrainingSuccess: (startDate: Date) => Promise<void>;
}

export function TrainingDetails({ isOpen, onClose, training, setTraining, onCreateReservationSuccess, onCancelTrainingSuccess }: TrainingModalProps) {
  const theme = useTheme();

  const { userRole } = useAuth();
  const [message, setMessage] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"details" | "selectClient">("details");
  const [selectedClient, setSelectedClient] = useState<ClientDTO | null>(null);

  const canBook = message === "";

  useEffect(() => {
    if (!isOpen) {
      setMessage("");
      setCancelError("");
      setIsLoading(true);
      setSelectedClient(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!training || !isOpen) return;
    if (userRole === "Admin" && selectedClient === null) return;
    if (training.trainingStatusId === 3) return;

    checkReservationCreation();
  }, [training, isOpen, selectedClient]);

  const checkReservationCreation = async () => {
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

  const handleCancel = async () => {
    if (window.confirm("Вы уверены, что хотите отменить эту тренировку?")) {
      try {
        const result = await apiClient.cancelTraining(training!.id!);
        setTraining(result);
        setCancelError("");
        await onCancelTrainingSuccess(result!.startDate!);
      } catch (error: any)
      {
        const message = error.message.split(": ")[1];
        setCancelError(message);
      }
    }
  }

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
      await onCreateReservationSuccess();
      //onClose();
    }
    catch (error: any)
    {
      setMessage(error.message);
    }
  }

  return (
    <>
    <Dialog open={isOpen && view === "details"} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: 24 }}>
        {trainingType.name}
      </DialogTitle>

      <DialogContent>
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
                Осталось {spotsLeft} {spotsLeft === 1 ? "место" : "мест"}
            </Box>
          )}

          {!canBook && !isLoading && (
            <Typography
              variant="body2"
              color={
                message === "Вы уже записаны" || message === "Клиент уже записан"
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

          {userRole === "Admin" && training?.trainingStatusId !== 3 && (
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
    </>
  );
}