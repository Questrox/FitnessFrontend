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
  CircularProgress
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import { CoachDTO, TrainingDTO, TrainingTypeDTO } from "../../api/g";
import { apiClient } from "../../api/apiClient";
import { CreateTrainingDialog } from "../TrainingModals/CreateTrainingDialog";

export function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState("Понедельник");
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [trainingTypes, setTrainingTypes] = useState<TrainingTypeDTO[]>([]);
  const [trainings, setTrainings] = useState<TrainingDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<any>(null);

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
      const currentDay = today.getDay();

      const monday = new Date(today);
      monday.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1) + selectedWeek * 7);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const weekTrainings = await apiClient.getTrainingsForPeriod(monday, sunday);
      console.log(weekTrainings[0].startDate);
      setTrainings(weekTrainings);
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
    const currentDay = today.getDay();

    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1) + selectedWeek * 7);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

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
        const end = new Date(training.endDate!);

        const trainingDay = start.toLocaleDateString("ru-RU", { weekday: "long" });
        if (trainingDay.toLowerCase() !== day.toLowerCase()) {
            // console.log("День тренировки: " + trainingDay);
            // console.log("Выбранный день: " + day);
            return false;
        }

        const timeHour = parseInt(time.split(":")[0]);

        return timeHour >= start.getHours() && timeHour < end.getHours();
    });
  };

  const handleTrainingClick = (training: any) => {
    setSelectedTraining(training);
    setModalOpen(true);
  };

  if (isLoading)
    return <CircularProgress/>

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

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Создать тренировку
          </Button>
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
                    : `Смещение: ${selectedWeek}`}
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

                    if (!type || !coach) return null;

                    const spotsLeft = type.maxClients! - training!.trainingReservations!.length;
                    const isFull = spotsLeft <= 0;

                    return (
                      <GridLegacy item xs={12} md={6} lg={4} key={training.id}>
                        <Card
                          sx={{ cursor: "pointer", "&:hover": { boxShadow: 4 } }}
                          onClick={() => handleTrainingClick(training)}
                        >
                          <CardContent>
                            <Typography fontWeight={600}>
                              {type.name}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                              {coach.user?.fullName}
                            </Typography>

                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              sx={{ mt: 2 }}
                            >
                              <Typography variant="body2">
                                {isFull
                                  ? "Нет мест"
                                  : `${spotsLeft} мест`}
                              </Typography>

                              <Typography fontWeight={600}>
                                ${type.price}
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

      </Container>
      <CreateTrainingDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        trainingTypes={trainingTypes}
        onSuccess={onCreateSuccess}
      />
    </Box>
  );
}
export default SchedulePage;