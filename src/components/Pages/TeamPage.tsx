import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

import { useEffect, useState } from "react";
import { CoachDTO, CoachScheduleDTO } from "../../api/g";
import { apiClient } from "../../api/apiClient";

export function TeamPage() {
  const theme = useTheme();

  const [coaches, setCoaches] = useState<CoachDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getCoaches();
      setCoaches(data);
    } catch (error) {
      console.error("Ошибка при получении тренеров:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Все дни недели по порядку
  const daysOfWeek = [
    { value: 1, label: "Понедельник" },
    { value: 2, label: "Вторник" },
    { value: 3, label: "Среда" },
    { value: 4, label: "Четверг" },
    { value: 5, label: "Пятница" },
    { value: 6, label: "Суббота" },
    { value: 0, label: "Воскресенье" }
  ];

  const getExperienceText = (years: number) => {
    const lastDigit = years % 10;
    const lastTwoDigits = years % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${years} лет`;
    if (lastDigit === 1) return `${years} год`;
    if (lastDigit >= 2 && lastDigit <= 4) return `${years} года`;
    return `${years} лет`;
  };

  // Функция для получения расписания по дню
  const getSchedulesForDay = (schedules: CoachScheduleDTO[] | undefined, dayValue: number) => {
    return schedules?.filter(s => s.weekDay === dayValue).sort((a, b) => {
        // Сравниваем строки времени "HH:MM:SS" или "HH:MM"
        if (!a.startTime || !b.startTime) return 0;
        return a.startTime.localeCompare(b.startTime);
      }) || [];
  };

  // Функция для форматирования времени (обрезает секунды)
  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  return (
  <Box
    sx={{
      minHeight: "100vh",
      py: 8,
      background: `linear-gradient(
        180deg,
        ${alpha(theme.palette.primary.main, 0.05)} 0%,
        ${theme.palette.background.default} 30%,
        ${theme.palette.background.default} 100%
      )`,
    }}
  >
    <Container maxWidth="xl">
      {/* Header */}
      <Box textAlign="center" mb={10}>
        <Typography
          variant="h2"
          fontWeight={800}
          sx={{
            mb: 3,
            background: `linear-gradient(
              90deg,
              ${theme.palette.primary.main},
              ${theme.palette.secondary.main}
            )`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: {
              xs: "2.5rem",
              md: "4rem",
            },
          }}
        >
          Команда клуба
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            maxWidth: 850,
            mx: "auto",
            lineHeight: 1.8,
          }}
        >
          Профессиональные тренеры, которые помогут
          вам уверенно двигаться к своим целям,
          поддерживать мотивацию и получать удовольствие
          от тренировок.
        </Typography>
      </Box>

      {/* Loading */}
      {isLoading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          py={12}
        >
          <CircularProgress size={52} />
        </Box>
      ) : (
        <Stack
          direction="row"
          spacing={4}
          justifyContent="center"
          alignItems="stretch"
          flexWrap="wrap"
          useFlexGap
        >
          {coaches.map((coach) => {
            return (
              <Card
                key={coach.id}
                sx={{
                  width: {
                    xs: "100%",
                    sm: 420,
                    md: 440,
                  },
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  transition: "0.25s",
                  flexShrink: 0,
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                }}
              >
                {/* Photo */}
                <Box
                  sx={{
                    height: 400,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    component="img"
                    src={coach.photoPath}
                    alt={coach.user?.fullName}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>

                <CardContent
                  sx={{
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                  }}
                >
                  {/* Name */}
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    sx={{
                      mb: 2,
                      lineHeight: 1.4,
                    }}
                  >
                    {coach.user?.fullName}
                  </Typography>

                  {/* Пустое пространство */}
                  <Box sx={{ flexGrow: 1 }} />

                  {/* Стаж и расписание - прижаты к низу */}
                  <Box>
                    {/* Experience */}
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <WorkspacePremiumIcon
                        color="action"
                        fontSize="small"
                      />
                      <Typography color="text.secondary">
                        Стаж: {getExperienceText(coach.experience!)}
                      </Typography>
                    </Stack>

                    {/* Schedule */}
                    <Box>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ mb: 2 }}
                      >
                        <CalendarMonthIcon
                          color="action"
                          fontSize="small"
                        />
                        <Typography fontWeight={700}>
                          График работы
                        </Typography>
                      </Stack>

                        <Stack spacing={1.5}>
                          {daysOfWeek.map((day) => {
                            const daySchedules = getSchedulesForDay(coach.coachSchedules, day.value);
                            const hasDaySchedules = daySchedules.length > 0;

                            return (
                              <Box key={day.value}>
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  color="primary.main"
                                  component="span"
                                  sx={{ mr: 1 }}
                                >
                                  {day.label}:
                                </Typography>

                                {hasDaySchedules ? (
                                  daySchedules.map((slot, idx) => (
                                    <Typography
                                      key={idx}
                                      variant="body2"
                                      component="span"
                                    >
                                      {formatTime(slot.startTime!)}-{formatTime(slot.endTime!)}
                                      {idx < daySchedules.length - 1 && ", "}
                                    </Typography>
                                  ))
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    component="span"
                                    fontStyle="italic"
                                  >
                                    Выходной
                                  </Typography>
                                )}
                              </Box>
                            );
                          })}
                        </Stack>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Container>
  </Box>
);
}

export default TeamPage;