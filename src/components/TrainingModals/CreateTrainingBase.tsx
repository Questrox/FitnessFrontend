import { Autocomplete, TextField } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { TrainingTypeDTO } from "../../api/g";

interface TrainingBaseFieldsProps {
  trainingTypes: TrainingTypeDTO[];

  trainingType: TrainingTypeDTO | null;
  setTrainingType: (v: TrainingTypeDTO | null) => void;

  startDateTime: Dayjs | null;
  setStartDateTime: (v: Dayjs | null) => void;
}

export function CreateTrainingBase({
  trainingTypes,
  trainingType,
  setTrainingType,
  startDateTime,
  setStartDateTime,
}: TrainingBaseFieldsProps) {
  const dayOfWeek = startDateTime
    ? startDateTime.format("dddd")
    : "";

  const endDateTime = startDateTime
    ? startDateTime.add(trainingType ? trainingType.duration! : 0, "minute")
    : null;

  return (
    <>
      {/* Тип тренировки */}
      <Autocomplete
        options={trainingTypes}
        getOptionLabel={(option) =>
          `${option.name} (${option.price}₽, ${option.cashbackPercentage}% кэшбека, ${option.maxClients} чел.)`
        }
        value={trainingType}
        onChange={(_, value) => setTrainingType(value)}
        renderInput={(params) => (
          <TextField {...params} label="Тип тренировки" />
        )}
      />

      {/* Дата */}
      <DateTimePicker
        label="Дата и время начала"
        minDateTime={dayjs()}
        value={startDateTime}
        onChange={(newValue) => setStartDateTime(newValue)}
        slotProps={{
          textField: { fullWidth: true },
        }}
      />

      {/* День недели */}
      <TextField
        label="День недели"
        value={
          dayOfWeek
            ? dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)
            : ""
        }
        InputProps={{ readOnly: true }}
        fullWidth
      />

      {/* Конец */}
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
    </>
  );
}