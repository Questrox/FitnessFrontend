import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  GridLegacy,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/Upload";
import { CoachDTO, CoachScheduleDTO, CreateCoachScheduleDTO } from "../../api/g";
import { apiClient } from "../../api/apiClient";
import { Dayjs } from "dayjs";
import { TimePicker } from "@mui/x-date-pickers";

const daysOfWeek = [
  { value: 1, label: "Понедельник" },
  { value: 2, label: "Вторник" },
  { value: 3, label: "Среда" },
  { value: 4, label: "Четверг" },
  { value: 5, label: "Пятница" },
  { value: 6, label: "Суббота" },
  { value: 0, label: "Воскресенье" },
];

interface EditCoachDialogProps {
  isOpen: boolean;
  onClose: () => void;
  coach: CoachDTO | null;
  setCoach: React.Dispatch<React.SetStateAction<CoachDTO | null>>;
  coaches: CoachDTO[];
  setCoaches: React.Dispatch<React.SetStateAction<CoachDTO[]>>;
  setCredentials: (value: any) => void;
}

export function EditCoachDialog({ isOpen, onClose, coach, setCoach, coaches, setCoaches, setCredentials }: EditCoachDialogProps) {
  const theme = useTheme();

  const [tab, setTab] = useState(0);
  const [error, setError] = useState("");
  const [scheduleError, setScheduleError] = useState("");

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [weekDay, setWeekDay] = useState(1);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);

  useEffect(() => {
    if (coach) {
      setFullName(coach.user?.fullName!);
      setPhoneNumber(coach.user?.phoneNumber!);
      setYearsExperience(coach.experience!.toString());
      setPhotoFile(null);
    }
  }, [coach]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleGenerateCredentials = async () => {
    if (window.confirm("Вы уверены, что хотите сгенерировать новые данные для входа? Несохраненные изменения будут утеряны!"))
    {
      try {
        const credentials = await apiClient.generateNewCredentials(coach?.userId);
        setCredentials({username: credentials.userName, password: credentials.password});
        handleClose();

        const updatedCoach = new CoachDTO(coach!);
        updatedCoach.user!.userName = credentials.userName;
        const updatedCoaches = coaches.map(c => c.id === coach!.id ? updatedCoach : c);
        setCoaches(updatedCoaches);
      } catch (error: any) {
        console.error(error.message);
      }
    }
  }

  const handleAddSchedule = async () => {
    if (!startTime || !endTime) return;
    if (startTime > endTime)
    {
      setScheduleError("Время начала должно быть раньше времени конца");
      return;
    }
    try {
      const model = new CreateCoachScheduleDTO();
      model.coachId = coach!.id;
      model.weekDay = weekDay;
      model.startTime = startTime.format("HH:mm:ss");
      model.endTime = endTime.format("HH:mm:ss");

      const created = await apiClient.addCoachSchedule(model);
      const updatedCoach = new CoachDTO(coach!);
      updatedCoach.coachSchedules = [...(updatedCoach.coachSchedules || []), created];
      setCoach(updatedCoach);

      const updatedCoaches = coaches.map(c => c.id === coach!.id ? updatedCoach : c);
      setCoaches(updatedCoaches);
    } catch (error: any)
    {
      setScheduleError(error.message);
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    if (window.confirm("Вы уверены, что хотите удалить данный слот расписания?"))
    {
      try {
        await apiClient.softDeleteCoachSchedule(id);

        const updatedCoach = new CoachDTO(coach!);
        updatedCoach.coachSchedules = coach?.coachSchedules!.filter(cs => cs.id !== id);
        setCoach(updatedCoach);

        const updatedCoaches = coaches.map(c => c.id === coach!.id ? updatedCoach : c);
        setCoaches(updatedCoaches);
      } catch (error: any) {
        console.error("Произошла ошибка при удалении слота расписания: ", error);
      }
    }
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();

    const isWhitespace = fullName.trim().length === 0 || phoneNumber.trim().length === 0;

    if (!fullName || !phoneNumber || !yearsExperience || isWhitespace) {
      setError("Заполните все поля");
      return;
    }

    if (parseInt(yearsExperience) < 0) {
      setError("Стаж не может быть отрицательным");
      return;
    }

    try {
      const fileParam = photoFile ? { data: photoFile, fileName: photoFile.name } : { data: new Blob(), fileName: "" }; 
      const updatedCoach = await apiClient.updateCoach(coach!.id!, coach?.id, fullName, phoneNumber, parseInt(yearsExperience), fileParam);
      const updatedCoaches = coaches.map(c => c.id === coach!.id ? updatedCoach : c);
      setCoaches(updatedCoaches);
      setError("");
    }
    catch (error: any) {
      setError(error.message);
    }
    alert("Изменения сохранены!");
  };

  const handleClose = () => {
    onClose();
    setPhotoFile(null);
    setTab(0);
    setWeekDay(1);
    setStartTime(null);
    setEndTime(null);
    setError("");
    setScheduleError("");
  }

  const getSchedulesForDay = (day: number) =>
    coach?.coachSchedules
      ?.filter((s) => s.weekDay === day)
      .sort((a, b) => {
        // Сравниваем строки времени "HH:MM:SS" или "HH:MM"
        if (!a.startTime || !b.startTime) return 0;
        return a.startTime.localeCompare(b.startTime);
      });

  if (!coach) return null;

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Редактирование тренера</DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Информация" />
          <Tab label="Расписание" />
        </Tabs>

        {/* === Вкладка информации === */}
        {tab === 0 && (
        <Box mt={3}>
          <Box
            component="form"
            onSubmit={handleSaveInfo}
            id="editCoachForm"
          >
            <Stack spacing={3}>
              {/* ФИО */}
              <TextField
                label="ФИО"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                fullWidth
                required
              />

              {/* Телефон */}
              <TextField
                label="Телефон"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                fullWidth
                required
              />

              {/* Стаж */}
              <TextField
                label="Стаж (лет)"
                type="number"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                fullWidth
                required
                inputProps={{ min: 0 }}
              />

              {/* Фото */}
              <Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  {(photoFile || coach.photoPath) && (
                    <Box
                      component="img"
                      src={
                        photoFile
                          ? URL.createObjectURL(photoFile)
                          : `/${coach.photoPath}`
                      }
                      sx={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        borderRadius: 2,
                      }}
                    />
                  )}

                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                  >
                    Загрузить изображение
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                  </Button>
                </Stack>
              </Box>
              {error && <Typography color="error" marginTop={1}>{error}</Typography>}

              {/* Кнопки */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                pt={2}
              >
                <Button
                  variant="outlined"
                  onClick={handleGenerateCredentials}
                >
                  Сгенерировать данные для входа
                </Button>

                <Stack direction="row" spacing={2}>
                  <Button onClick={handleClose}>Отмена</Button>
                  <Button
                    type="submit"
                    variant="contained"
                    form="editCoachForm"
                  >
                    Сохранить
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </Box>
      )}

        {/* === Вкладка расписания === */}
        {tab === 1 && (
          <Box mt={3}>
            <Stack spacing={3}>
              {/* Добавление */}
              <Card
                sx={{
                  border: `1px ${theme.palette.primary.main}`,
                  backgroundColor: theme.palette.action.hover,
                }}
              >
                <CardContent>
                  <Typography fontWeight={600} mb={2}>
                    Добавить временной слот
                  </Typography>

                  <Stack spacing={2}>
                    <TextField
                      select
                      label="День недели"
                      SelectProps={{ native: true }}
                      value={weekDay}
                      onChange={(e) =>
                        setWeekDay(Number(e.target.value))
                      }
                    >
                      {daysOfWeek.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </TextField>

                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box sx={{ flex: 1 }}>
                        <TimePicker
                          label="Начало"
                          value={startTime}
                          onChange={(newValue: Dayjs | null) => setStartTime(newValue)}
                          format="HH:mm"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              required: true,
                            },
                            actionBar: {
                              actions: [] // Чтобы не было панели с "ОК" и "Отмена" 
                            },
                          }}
                        />
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <TimePicker
                          label="Конец"
                          minTime={startTime || undefined}
                          value={endTime}
                          onChange={(newValue: Dayjs | null) => setEndTime(newValue)}
                          format="HH:mm"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              required: true,
                            },
                          }}
                        />
                      </Box>
                    </Stack>
                    {scheduleError && <Typography color="error" marginTop={1}>{scheduleError}</Typography>}
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddSchedule}
                      disabled={
                        !startTime || !endTime
                      }
                    >
                      Добавить
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {/* Список */}
              <Box>
                <Typography fontWeight={600} mb={2}>
                  Текущее расписание
                </Typography>

                <Stack spacing={2}>
                  {daysOfWeek.map((day) => {
                    const list = getSchedulesForDay(day.value);
                    if (!list)
                      return null;

                    return (
                      <Card key={day.value}>
                        <CardContent>
                          <Typography fontWeight={600} mb={2}>
                            {day.label}
                          </Typography>

                          {list.length > 0 ? (
                            <Stack spacing={1}>
                              {list.map((s) => (
                                <Box
                                  key={s.id}
                                  display="flex"
                                  justifyContent="space-between"
                                  alignItems="center"
                                  sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: theme.palette.action.hover,
                                  }}
                                >
                                  <Stack direction="row" spacing={1}>
                                    <AccessTimeIcon fontSize="small" />
                                    <Typography>
                                      {s.startTime!.substring(0, 5)} — {s.endTime!.substring(0, 5)}
                                    </Typography>
                                  </Stack>

                                  <IconButton
                                    color="error"
                                    onClick={() =>
                                      handleDeleteSchedule(s.id!)
                                    }
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Box>
                              ))}
                            </Stack>
                          ) : (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              Выходной
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              </Box>
            </Stack>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}