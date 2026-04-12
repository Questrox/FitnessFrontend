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
import { CreateTrainingReservationDTO, TrainingDTO } from "../../api/g";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { apiClient } from "../../api/apiClient";

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  training: TrainingDTO | null;
  setTraining: React.Dispatch<React.SetStateAction<TrainingDTO | null>>;
  onSuccess: () => Promise<void>
}

export function TrainingDetails({ isOpen, onClose, training, setTraining, onSuccess }: TrainingModalProps) {
  const theme = useTheme();

  const { userRole } = useAuth();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const canBook = message === "";

  useEffect(() => {
    if (!isOpen) {
      setMessage("");
      setIsLoading(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!training || !isOpen) return;

    setIsLoading(true);

    (async () => {
      try {
        const result = await apiClient.checkReservationPossibility(
          training.id,
          undefined
        );

        setMessage(result);
      } catch (error) {
        console.error("Ошибка при проверке возможности записи", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [training, isOpen]);

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
      dto.clientId = undefined; // ПЕРЕДЕЛАТЬ ДЛЯ АДМИНА
      const result = await apiClient.addReservation(dto);
      setTraining((prev) => {
        if (!prev) return prev;
        const next = new TrainingDTO(prev.toJSON());
        next.reservationsCount = (prev.reservationsCount ?? 0) + 1;
        return next;
      });
      await onSuccess();
      //onClose();
    }
    catch (error: any)
    {
      setMessage(error.message);
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
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
          {isFull ? (
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
                Нет свободных мест
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

          {/* Кнопки */}
          <Stack direction="row" spacing={2}>
            {userRole === "User" &&
             <Button
              fullWidth
              variant="contained"
              disabled={isLoading || !canBook}
              onClick={() => {handleCreateReservation()}}
            >
              {isLoading ? (
              <CircularProgress size={24} color="inherit" />
              ) : (
                "Записаться"
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
  );
}