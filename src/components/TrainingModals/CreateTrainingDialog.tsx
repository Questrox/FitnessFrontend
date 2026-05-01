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
import dayjs, { Dayjs } from "dayjs";
import { CoachDTO, CreateTrainingDTO, TrainingTypeDTO } from "../../api/g";
import { apiClient } from "../../api/apiClient";
import { CreateTrainingBase } from "./CreateTrainingBase";

interface CreateTrainingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  trainingTypes: TrainingTypeDTO[];
  onSuccess: (startDate: Date) => Promise<void>;
  selectedDay: Dayjs | null
}

export function CreateTrainingDialog({
  isOpen,
  onClose,
  trainingTypes,
  onSuccess,
  selectedDay
}: CreateTrainingDialogProps) {
  const [trainingType, setTrainingType] = useState<TrainingTypeDTO | null>(null);
  const [availableCoaches, setAvailableCoaches] = useState<CoachDTO[]>([]);
  const [coach, setCoach] = useState<CoachDTO | null>(null);
  const [startDateTime, setStartDateTime] = useState<Dayjs | null>(null);
  const [error, setError] = useState<string>("");

  const endDateTime = startDateTime
    ? startDateTime.add(trainingType ? trainingType.duration! : 0, "minute")
    : null;

  useEffect(() => {
    (async () => {
      setCoach(null);

      if (!startDateTime || !endDateTime || !trainingType) return;

      try {
        const coaches = await apiClient.getAvailableCoaches(
          startDateTime.toDate(),
          endDateTime.toDate()
        );
        setAvailableCoaches(coaches);
      } catch (error) {
        console.error("Ошибка при загрузке тренеров:", error);
      }
    })();
  }, [startDateTime, trainingType]);

  useEffect(() => {
    setTrainingType(null);
    setCoach(null);
    setStartDateTime(selectedDay);
    setError("");
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleCreate = async () => {
    if (startDateTime! < dayjs())
    {
      setError("Нельзя создать тренировку ранее текущей даты и времени");
      return;
    }

    try {
      const training = new CreateTrainingDTO();
      training.coachId = coach!.id;
      training.trainingTypeId = trainingType!.id;
      training.startDate = startDateTime!.toDate();

      await apiClient.addTraining(training);
      await onSuccess(startDateTime!.toDate());

      handleClose();
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Создание тренировки</DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>

          {/* ОБЩАЯ ЧАСТЬ */}
          <CreateTrainingBase
            trainingTypes={trainingTypes}
            trainingType={trainingType}
            setTrainingType={setTrainingType}
            startDateTime={startDateTime}
            setStartDateTime={setStartDateTime}
          />

          {/* УНИКАЛЬНАЯ ЧАСТЬ */}
          <Autocomplete
            options={availableCoaches}
            disabled={
              availableCoaches.length === 0 ||
              startDateTime === null ||
              trainingType === null
            }
            getOptionLabel={(option) => option.user!.fullName!}
            value={coach}
            onChange={(_, value) => setCoach(value)}
            renderInput={(params) => {
              const isSelecting = !startDateTime || !trainingType;
              const noCoaches = availableCoaches.length === 0;

              let label = "Тренер";
              let error = false;

              if (isSelecting) {
                label = "Выберите дату и тип тренировки";
              } else if (noCoaches) {
                label = "Нет свободных тренеров";
                error = true;
              }

              return <TextField {...params} label={label} error={error} />;
            }}
          />

          {error && (
            <Typography color="error">{error}</Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Отмена</Button>

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