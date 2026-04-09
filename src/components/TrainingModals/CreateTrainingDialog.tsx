import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Autocomplete } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { CoachDTO, CreateTrainingDTO, TrainingTypeDTO } from "../../api/g";
import { apiClient } from "../../api/apiClient";

interface CreateTrainingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  trainingTypes: TrainingTypeDTO[];
  onSuccess: (startDate: Date) => Promise<void>;
}

export function CreateTrainingDialog({
  isOpen,
  onClose,
  trainingTypes,
  onSuccess
}: CreateTrainingDialogProps) {
  const [trainingType, setTrainingType] = useState<TrainingTypeDTO | null>(null);
  const [availableCoaches, setAvailableCoaches] = useState<CoachDTO[]>([]);
  const [coach, setCoach] = useState<CoachDTO | null>(null);
  const [startDateTime, setStartDateTime] = useState<Dayjs | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const coaches = await apiClient.getCoaches(); // ЗАМЕНИТЬ НА ОТДЕЛЬНЫЙ МЕТОД И ВЫЗЫВАТЬ ПРИ КАЖДОМ ИЗМЕНЕНИИ ДАТЫ ИЛИ ЧЕГО-ТО ТАКОГО
        setAvailableCoaches(coaches);
      }
      catch (error)
      {
        console.error("Ошибка при загрузке тренеров: " + error);
      }
    })();
    setIsLoading(false);
  }, [])

  useEffect(() => {
    setTrainingType(null);
    setCoach(null);
    setStartDateTime(null);
  }, [isOpen]);
  

  // День недели из даты
  const dayOfWeek = startDateTime
    ? startDateTime.format("dddd")
    : "";

  // Конец
  const endDateTime = startDateTime
    ? startDateTime.add(trainingType ? trainingType.duration! : 2, "minute")
    : null;

  const handleClose = () => {
    setTrainingType(null);
    setCoach(null);
    setStartDateTime(null);
    setError("");
    onClose();
  };

  const handleCreate = async () => {
    try
    {
        const training = new CreateTrainingDTO();
        training.coachId = coach!.id;
        training.trainingTypeId = trainingType!.id;
        training.startDate = startDateTime!.toDate();
        const result = await apiClient.addTraining(training);
        await onSuccess(startDateTime!.toDate());
        handleClose();
    }
    catch (error: any)
    {
        setError(error.message);
    }
  };

  if (isLoading)
      return <CircularProgress/>

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Создание тренировки</DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>

          {/* Тип тренировки */}
          <Autocomplete
            options={trainingTypes}
            getOptionLabel={(option) => `${option.name} (${option.price}₽, ${option.cashbackPercentage}% кэшбека, ${option.maxClients} чел.)`}
            value={trainingType}
            onChange={(_, value) => setTrainingType(value)}
            renderInput={(params) => (
              <TextField {...params} label="Тип тренировки" />
            )}
          />

          {/* Тренер */}
          <Autocomplete
            options={availableCoaches}
            getOptionLabel={(option) => option.user!.fullName!}
            value={coach}
            onChange={(_, value) => setCoach(value)}
            renderInput={(params) => (
              <TextField {...params} label="Тренер" />
            )}
          />

          {/* Дата и время начала */}
          <DateTimePicker
            label="Дата и время начала"
            value={startDateTime}
            onChange={(newValue) => setStartDateTime(newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
              },
            }}
          />

          {/* День недели (readonly) */}
          <TextField
            label="День недели"
            value={String(dayOfWeek).charAt(0).toUpperCase() + String(dayOfWeek).slice(1)}
            InputProps={{ readOnly: true }}
            fullWidth
          />

          {/* Дата и время конца (readonly) */}
          <TextField
            label="Дата и время окончания"
            value={
              endDateTime
                ? endDateTime.format("DD.MM.YYYY HH:mm")
                : ""
            }
            InputProps={{ readOnly: true }}
            fullWidth
          />
          {error && <Typography color="error" marginTop={1}>{error}</Typography>}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Отмена
        </Button>

        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={!trainingType || !coach || !startDateTime}
        >
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );
}