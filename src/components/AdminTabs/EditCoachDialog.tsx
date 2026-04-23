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
import { CoachDTO, CoachScheduleDTO } from "../../api/g";

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
}

export function EditCoachDialog({ isOpen, onClose, coach }: EditCoachDialogProps) {
  const theme = useTheme();

  const [tab, setTab] = useState(0);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [schedules, setSchedules] = useState<CoachScheduleDTO[]>([]);
  const [newSchedule, setNewSchedule] = useState({
    weekDay: 1,
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    if (coach) {
      setFullName(coach.user?.fullName!);
      setPhoneNumber(coach.user?.phoneNumber!);
      setYearsExperience(coach.experience!.toString());
      setSchedules(coach.coachSchedules!);
      setPhotoFile(null);
    }
  }, [coach]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleAddSchedule = () => {
    if (!newSchedule.startTime || !newSchedule.endTime) return;

    alert("Добавление нового слота расписания");
//     const schedule = new CoachScheduleDTO()
//       id: Date.now(),
//       weekDay: newSchedule.weekDay,
//       startTime: newSchedule.startTime,
//       endTime: newSchedule.endTime,
//       coachId: Number(coach?.id),
//   );

//     setSchedules((prev) => [...prev, schedule]);
//     setNewSchedule({ weekDay: 1, startTime: "", endTime: "" });
  };

  const handleDeleteSchedule = (id: number) => {
    alert("Удаление слота расписания");
    //setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveInfo = () => {
    alert("Сохранение изменений");

    // const updatedCoach = {
    //   id: coach?.id,
    //   fullName,
    //   userName,
    //   phoneNumber,
    //   yearsExperience: parseInt(yearsExperience),
    //   photo: photoFile ? photoFile.name : "без изменений",
    // };

    // console.log(updatedCoach);
  };

  const getSchedulesForDay = (day: number) =>
    schedules.filter((s) => s.weekDay === day);

  if (!coach) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Редактирование тренера</DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Информация" />
          <Tab label="Расписание" />
        </Tabs>

        {/* === Вкладка информации === */}
        {tab === 0 && (
          <Box mt={3}>
            <Stack spacing={3}>
              {coach.photoPath && (
                <Box display="flex" justifyContent="center">
                  <Box
                    component="img"
                    src={`/${coach.photoPath}`}
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: `2px solid ${theme.palette.divider}`,
                    }}
                  />
                </Box>
              )}

              <TextField
                label="ФИО"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                fullWidth
              />

              <TextField
                label="Телефон"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                fullWidth
              />

              <TextField
                label="Стаж (лет)"
                type="number"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                fullWidth
              />

              <Box>
                <input
                  id="photo"
                  type="file"
                  hidden
                  onChange={handlePhotoChange}
                />
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => document.getElementById("photo")?.click()}
                  fullWidth
                >
                  {photoFile ? photoFile.name : "Выбрать фото"}
                </Button>
              </Box>

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button onClick={onClose}>Отмена</Button>
                <Button variant="contained" onClick={handleSaveInfo}>
                  Сохранить
                </Button>
              </Stack>
            </Stack>
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
                      value={newSchedule.weekDay}
                      onChange={(e) =>
                        setNewSchedule({
                          ...newSchedule,
                          weekDay: Number(e.target.value),
                        })
                      }
                    >
                      {daysOfWeek.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </TextField>

                    <GridLegacy container spacing={2}>
                      <GridLegacy item xs={6}>
                        <TextField
                          type="time"
                          label="Начало"
                          value={newSchedule.startTime}
                          onChange={(e) =>
                            setNewSchedule({
                              ...newSchedule,
                              startTime: e.target.value,
                            })
                          }
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </GridLegacy>
                      <GridLegacy item xs={6}>
                        <TextField
                          type="time"
                          label="Конец"
                          value={newSchedule.endTime}
                          onChange={(e) =>
                            setNewSchedule({
                              ...newSchedule,
                              endTime: e.target.value,
                            })
                          }
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </GridLegacy>
                    </GridLegacy>

                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddSchedule}
                      disabled={
                        !newSchedule.startTime || !newSchedule.endTime
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
                                      {s.startTime} — {s.endTime}
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