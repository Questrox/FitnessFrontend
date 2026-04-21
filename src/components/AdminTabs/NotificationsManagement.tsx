import {
  Box,
  Card,
  CardContent,
  GridLegacy,
  Typography,
  Stack,
  Chip,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { NotificationDetailsDialog } from "./NotificationDetailsDialog";
import { TrainingWithNotificationsDTO } from "../../api/g";
import { apiClient } from "../../api/apiClient";

export function NotificationsManagement() {
  const [selectedTraining, setSelectedTraining] = useState<TrainingWithNotificationsDTO | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState<TrainingWithNotificationsDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleTrainingClick = (training: TrainingWithNotificationsDTO) => {
    setSelectedTraining(training);
    setDialogOpen(true);
  };

  const handleNotifyClient = async (notificationId: number) => {
    if (window.confirm("Подтвердить уведомление клиента?"))
    {
        try {
            const updatedNotification = await apiClient.confirmNotification(notificationId);
            const updatedTraining = new TrainingWithNotificationsDTO(selectedTraining!);
            const updatedNotifications = selectedTraining!.notifications!.map(notification =>
                    notification.id === updatedNotification.id
                        ? updatedNotification
                        : notification);
            updatedTraining.notifications = updatedNotifications;
            updatedTraining.notNotifiedCount! -= 1;
            setSelectedTraining(updatedTraining);

            setNotifications(prevNotifications =>
                    prevNotifications.map(dto =>
                        dto.training!.id === updatedTraining.training!.id
                            ? updatedTraining
                            : dto
                    )
            );
        } catch (error: any)
        {
            console.error("Ошибка при подтверждении уведомления клиента: " + error);
        }
    }
  };

  const formatDateTime = (dateString: Date) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchNotifications();
  }, [])

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
        const result = await apiClient.getTrainingsWithNotifications();
        setNotifications(result);
    } catch (error: any) {
        console.error("Ошибка при загрузке уведомлений: " + error.message);
    }
    setIsLoading(false);
  }

  if (isLoading)
    return <CircularProgress />

  return (
    <Box sx={{ width: "100%" }}>
        {notifications.length > 0 ? (
            <GridLegacy container spacing={3} sx={{ width: "100%", m: 0 }}>
                {notifications.map((item) => {
                    const training = item.training!;
                    const type = training.trainingType!;
                    const coach = training.coach!;

                    if (item.notNotifiedCount! === 0)
                        return null;

                    return (
                        <GridLegacy item xs={12} key={training.id}>
                            <Card
                                sx={{
                                    cursor: "pointer",
                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    display: "flex",
                                    flexDirection: "column",
                                    position: "relative",
                                    overflow: "hidden",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: (theme) => theme.shadows[8],
                                    },
                                    "&:active": {
                                        transform: "translateY(0)",
                                    },
                                }}
                                onClick={() => handleTrainingClick(item)}
                            >

                                <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                                    <Stack spacing={2.5}>
                                        {/* Заголовок + счетчик */}
                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                        >
                                            <Typography
                                                variant="h6"
                                                fontWeight={700}
                                                sx={{
                                                    fontSize: { xs: "1rem", sm: "1.1rem" },
                                                    lineHeight: 1.3,
                                                }}
                                            >
                                                {type.name}
                                            </Typography>
                                        </Stack>

                                        {/* Тренер */}
                                        <Stack direction="row" spacing={1} alignItems="center">
                                           
                                            <Typography variant="body2" color="text.secondary">
                                                Тренер: {coach.user?.fullName}
                                            </Typography>
                                        </Stack>

                                        {/* Даты */}
                                        <Stack spacing={1.5}>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <CalendarMonthIcon
                                                    fontSize="small"
                                                    color="action"
                                                    sx={{ fontSize: 20 }}
                                                />
                                                <Typography variant="body2" color="text.primary">
                                                    {"Начало: " + formatDateTime(training.startDate!)}
                                                </Typography>
                                            </Stack>

                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <AccessTimeIcon
                                                    fontSize="small"
                                                    color="action"
                                                    sx={{ fontSize: 20 }}
                                                />
                                                <Typography variant="body2" color="text.primary">
                                                    {"Конец: " + formatDateTime(training.endDate!)}
                                                </Typography>
                                            </Stack>
                                        </Stack>

                                        {/* Подсказка */}
                                        <Box
                                            sx={{
                                                mt: 1,
                                                pt: 1.5,
                                                borderTop: "1px solid",
                                                borderColor: "divider",
                                            }}
                                        >
                                            <Typography
                                                variant="body1"
                                                fontWeight={700}
                                            >
                                                Осталось уведомить {item.notNotifiedCount}{" "}
                                                {item.notNotifiedCount === 1 ? "клиента" : "клиентов"}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </GridLegacy>
                    );
                })}
            </GridLegacy>
        ) : (
            <Card
                elevation={0}
                sx={{
                    width: "100%",
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    background: (theme) => theme.palette.background.paper,
                    transition: "all 0.3s ease",
                }}
            >
                <CardContent
                    sx={{
                        textAlign: "center",
                        py: { xs: 6, sm: 8, md: 10 },
                        px: { xs: 3, sm: 4 },
                    }}>
                    <Stack spacing={3} alignItems="center">
                        <Box
                            sx={(theme) => ({
                                borderRadius: "50%",
                                width: { xs: 72, sm: 88 },
                                height: { xs: 72, sm: 88 },
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "transform 0.3s ease",
                                "&:hover": {
                                    transform: "translateY(-4px)",
                                },
                            })}>
                            <NotificationsOffIcon
                                sx={{
                                    fontSize: { xs: 36, sm: 44 },
                                }}/>
                        </Box>

                        <Stack spacing={1.5}>
                            <Typography
                                variant="h4"
                                fontWeight={700}
                                sx={{
                                    fontSize: { xs: "1.5rem", sm: "2rem" },
                                    backgroundClip: "text",
                                    WebkitBackgroundClip: "text",
                                }}>
                                Нет уведомлений
                            </Typography>

                            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 450 }}>
                                Все клиенты успешно уведомлены
                                <br />
                                об отмененных тренировках
                            </Typography>
                        </Stack>

                        <Box
                            sx={{
                                display: "flex",
                                gap: 1,
                                justifyContent: "center",
                                mt: 1,
                            }}
                        >
                </Box>
            </Stack>
        </CardContent>
    </Card>
    )}

        <NotificationDetailsDialog
            isOpen={dialogOpen}
            onClose={() => setDialogOpen(false)}
            data={selectedTraining}
            onNotifyClient={handleNotifyClient}
        />
    </Box>
);
}