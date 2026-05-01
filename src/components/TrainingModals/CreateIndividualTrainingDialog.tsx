import { Dialog, DialogTitle, DialogContent, Stack, Autocomplete, TextField, Typography, DialogActions, Button } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { useState, useEffect } from "react";
import { apiClient } from "../../api/apiClient";
import { TrainingTypeDTO, ClientDTO, CreateIndividualTrainingDTO } from "../../api/g";
import { CreateTrainingBase } from "./CreateTrainingBase";
import { ClientSelectDialog } from "./ClientSelectDialog";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  trainingTypes: TrainingTypeDTO[];
  onSuccess: (date: Date) => Promise<void>;
  selectedDay: Dayjs | null
}

export function CreateIndividualTrainingDialog({
  isOpen,
  onClose,
  trainingTypes,
  onSuccess,
  selectedDay
}: Props) {
  const [trainingType, setTrainingType] = useState<TrainingTypeDTO | null>(null);
  const [startDateTime, setStartDateTime] = useState<Dayjs | null>(null);
  const [view, setView] = useState<"form" | "selectClient">("form");
  const [selectedClient, setSelectedClient] = useState<ClientDTO | null>(null);

  const [message, setMessage] = useState<string>("");
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState("");
  

  const endDateTime = startDateTime
    ? startDateTime.add(trainingType ? trainingType.duration! : 0, "minute")
    : null;

  // Проверка возможности
  useEffect(() => {
    if (!startDateTime || !endDateTime || !trainingType || !selectedClient)
      return;

    checkPossibility();
  }, [startDateTime, trainingType, selectedClient]);

  const checkPossibility = async () => {
    setIsChecking(true);
    try {
      const model = new CreateIndividualTrainingDTO();
      model.clientId = selectedClient!.id;
      model.startDate = startDateTime?.toDate();
      model.trainingTypeId = trainingType!.id;
      const result = await apiClient.checkIndividualTrainingCreationPossibility(model);
      setMessage(result);
    } catch (e) {
      console.error("Ошибка проверки", e);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    setView("form");
    setTrainingType(null);
    setStartDateTime(selectedDay);
    setSelectedClient(null);
    setMessage("");
    setError("");
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleCreate = async () => {
    if (startDateTime! < dayjs()) {
      setError("Нельзя создать тренировку в прошлом");
      return;
    }

    try {
      const model = new CreateIndividualTrainingDTO();
      model.trainingTypeId = trainingType!.id;
      model.startDate = startDateTime!.toDate();
      model.clientId = selectedClient!.id;

      const result = await apiClient.addIndividualTraining(model);

      await onSuccess(startDateTime!.toDate());
      handleClose();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <>
    <Dialog open={isOpen && view === "form"} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Индивидуальная тренировка</DialogTitle>

      <DialogContent>
        <Stack spacing={3} mt={1}>

          {/* ОБЩИЕ ПОЛЯ */}
          <CreateTrainingBase
            trainingTypes={trainingTypes}
            trainingType={trainingType}
            setTrainingType={setTrainingType}
            startDateTime={startDateTime}
            setStartDateTime={setStartDateTime}
          />
          
          {/* СТАТУС ПРОВЕРКИ */}
          {isChecking && <Typography>Проверка...</Typography>}

          {message && (
            <Typography
              color={
                message.includes("можно") ? "success.main" : "error"
              }
            >
              {message}
            </Typography>
          )}

          {error && <Typography color="error">{error}</Typography>}

          {/* КЛИЕНТ */}
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setView("selectClient")}
            >
            {selectedClient
                ? `Клиент: ${selectedClient.user?.fullName}`
                : "Выбрать клиента"}
          </Button>

        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Отмена</Button>

        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={
            !trainingType ||
            !startDateTime ||
            !selectedClient ||
            isChecking ||
            message !== ""
          }
        >
          Создать
        </Button>
      </DialogActions>
    </Dialog>
    <ClientSelectDialog
      open={isOpen && view === "selectClient"}
      onClose={() => setView("form")}
      onSelect={(client) => {
        setSelectedClient(client);
        setView("form");
      }}
    />
    </>
  );
}