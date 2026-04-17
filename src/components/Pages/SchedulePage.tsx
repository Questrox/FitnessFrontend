import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  IconButton,
  GridLegacy,
  CircularProgress,
  Divider
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import { CoachDTO, TrainingDTO, TrainingTypeDTO } from "../../api/g";
import { apiClient } from "../../api/apiClient";
import { CreateTrainingDialog } from "../TrainingModals/CreateTrainingDialog";
import { useAuth } from "../../context/AuthContext";
import { TrainingDetails } from "../TrainingModals/TrainingDetails";

export function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [trainingTypes, setTrainingTypes] = useState<TrainingTypeDTO[]>([]);
  const [trainings, setTrainings] = useState<TrainingDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<TrainingDTO | null>(null);

  const { userRole } = useAuth();

  const daysOfWeek = [
    "Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"
  ];

  const timeSlots = [
    "00:00","01:00","02:00","03:00","04:00","05:00",
    "06:00","07:00","08:00","09:00","10:00","11:00",
    "12:00","13:00","14:00","15:00","16:00","17:00",
    "18:00","19:00","20:00","21:00","22:00","23:00"
  ];

  useEffect(() => {
    (async () => {
      // Вычисляем текущий день, т.к. getDay возвращает число от 0 до 6, где 0 - воскресенье, 1 - понедельник и т.д.
      setSelectedDay(daysOfWeek[(new Date().getDay() + 6) % 7]);
      try {
        const types = await apiClient.getTrainingTypes();
        setTrainingTypes(types);
      }
      catch (error)
      {
        console.error("Ошибка при загрузке начальных данных: " + error);
      }
      setIsLoading(false);
    })();
  }, [])
  
  useEffect(() => {
    fetchWeekTrainings();
  }, [selectedWeek])

  const fetchWeekTrainings = async () =>
  {
    setIsLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const currentDay = today.getDay();

      const monday = new Date(today);
      monday.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1) + selectedWeek * 7);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const weekTrainings = await apiClient.getTrainingsForPeriod(monday, sunday);
      //console.log(weekTrainings[0].startDate);
      setTrainings(weekTrainings);
      // console.log(monday)
      // console.log(sunday)
    }
    catch (error)
    {
        console.error("Ошибка при загрузке тренировок за неделю: " + error);
    }
    setIsLoading(false);
  }

  const onCreateSuccess = async (startDate: Date) =>
  {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentDay = today.getDay();

    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1) + selectedWeek * 7);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    // console.log(monday)
    // console.log(sunday)

    startDate.setHours(0, 0, 0, 0);
    if (startDate >= monday && startDate <= sunday)
      await fetchWeekTrainings();
  }

  const getWeekDateRange = (weekOffset: number) => {
    const today = new Date();
    const currentDay = today.getDay();

    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1) + weekOffset * 7);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return `${monday.toLocaleDateString()} - ${sunday.toLocaleDateString()}`;
  };

  const getTrainingsForDayAndTime = (day: string, time: string) => {
    return trainings.filter((training) => {
      const start = new Date(training.startDate!);

      const trainingDay = start.toLocaleDateString("ru-RU", { weekday: "long" });
      if (trainingDay.toLowerCase() !== day.toLowerCase()) return false;

      const timeHour = parseInt(time.split(":")[0]);

      return start.getHours() === timeHour;
    });
  };

  const hasTrainingsForDay = trainings.some((t) => {
    const start = new Date(t.startDate!);
    const dayName = start.toLocaleDateString("ru-RU", { weekday: "long" });
    return dayName.toLowerCase() === selectedDay.toLowerCase();
  });

  const handleTrainingClick = (training: TrainingDTO) => {
    setSelectedTraining(training);
    setModalOpen(true);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 6 }}>
      <Container maxWidth="lg">

        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Расписание
            </Typography>
            <Typography color="text.secondary">
              Выберите день недели
            </Typography>
          </Box>

          {userRole !== "User" && userRole && 
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Создать тренировку
            </Button>
          }
        </Stack>

        {/* Week selector */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <IconButton onClick={() => setSelectedWeek((p) => p - 1)}>
                <ChevronLeftIcon />
              </IconButton>

              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  {selectedWeek === 0
                    ? "Текущая неделя"
                    : `${Math.abs(selectedWeek)} нед. ${selectedWeek > 0 ? "вперед" : "назад"}`}
                </Typography>
                <Typography fontWeight={600}>
                  {getWeekDateRange(selectedWeek)}
                </Typography>
              </Box>

              <IconButton onClick={() => setSelectedWeek((p) => p + 1)}>
                <ChevronRightIcon />
              </IconButton>
            </Stack>
          </CardContent>
        </Card>

        {/* Day selector */}
        <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: "auto" }}>
          {daysOfWeek.map((day) => (
            <Button
              key={day}
              variant={selectedDay === day ? "contained" : "outlined"}
              onClick={() => setSelectedDay(day)}
            >
              {day}
            </Button>
          ))}
        </Stack>

        {/* Schedule */}
        {isLoading ? (
          <CircularProgress />
        ) : !hasTrainingsForDay ? (
          <Card
            sx={{
              mt: 2,
              borderRadius: 3,
              textAlign: "center",
            }}
          >
            <CardContent sx={{ py: 6 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Нет тренировок
              </Typography>

              <Typography variant="body2" color="text.secondary">
                В выбранный день тренировки не запланированы
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={3}>
            {timeSlots.map((time) => {
              const dayTrainings = getTrainingsForDayAndTime(selectedDay, time);

              if (dayTrainings.length === 0) return null;

              return (
                <Stack key={time} direction="row" spacing={2}>
                  {/* Time */}
                  <Box sx={{ width: 80 }}>
                    <Typography fontWeight={600}>{time}</Typography>
                  </Box>

                  {/* Trainings */}
                  <GridLegacy container spacing={2}>
                    {dayTrainings.map((training) => {
                      const type = training.trainingType!;
                      const coach = training.coach!;

                      const start = new Date(training.startDate!);
                      const timeLabel = start.toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      if (!type || !coach) return null;

                      const spotsLeft =
                        type.maxClients! - training!.reservationsCount!;
                      const isFull = spotsLeft <= 0;

                      return (
                        <GridLegacy item xs={12} md={6} lg={4} key={training.id}>
                          <Card
                            sx={{
                              cursor: "pointer",
                              "&:hover": { boxShadow: 4 },
                            }}
                            onClick={() => handleTrainingClick(training)}
                          >
                            <CardContent>
                              <Typography fontWeight={600}>
                                {type.name}
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                              >
                                {timeLabel}
                              </Typography>

                              <Divider />

                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                sx={{ mt: 2 }}
                              >
                                <Typography variant="body2">
                                  {isFull
                                    ? "Нет мест"
                                    : `${spotsLeft} ${
                                        spotsLeft === 1 ? "место" : "мест"
                                      }`}
                                </Typography>

                                <Typography fontWeight={600}>
                                  {type.price! > 0
                                    ? `${type.price} ₽`
                                    : "Бесплатная"}
                                </Typography>
                              </Stack>
                            </CardContent>
                          </Card>
                        </GridLegacy>
                      );
                    })}
                  </GridLegacy>
                </Stack>
              );
            })}
          </Stack>
        )}

      </Container>
      <CreateTrainingDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        trainingTypes={trainingTypes}
        onSuccess={onCreateSuccess}
      />
      <TrainingDetails
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        training={selectedTraining}
        setTraining={setSelectedTraining}
        onSuccess={fetchWeekTrainings}
      />
    </Box>
  );
}
export default SchedulePage;