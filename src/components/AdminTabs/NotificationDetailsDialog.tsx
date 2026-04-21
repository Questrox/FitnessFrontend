import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Stack,
  Card,
  Box,
  Button,
  Divider,
  Chip,
  DialogActions,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { TrainingWithNotificationsDTO } from "../../api/g";

interface NotificationDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: TrainingWithNotificationsDTO | null;
  onNotifyClient?: (notificationId: number) => Promise<void>;
}

export function NotificationDetailsDialog({
  isOpen,
  onClose,
  data,
  onNotifyClient,
}: NotificationDetailsDialogProps) {
  if (!data) return null;

  const { training, notifications } = data;

  const formatDateTime = (dateString: Date) =>
    new Date(dateString).toLocaleString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const unnotified = notifications!.filter((n) => n.adminId === null);
  const notified = notifications!.filter((n) => n.adminId !== null);

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" fontWeight={600}>
                Детали уведомлений
            </Typography>
        </DialogTitle>

        <DialogContent>
            <Stack spacing={3}>
                {/* Тренировка */}
                <Box
                    sx={(theme) => ({
                        bgcolor: theme.palette.action.hover,
                        borderRadius: 2,
                        p: 2.5,
                    })}
                >
                    <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
                        {training!.trainingType!.name}
                    </Typography>

                    <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <CalendarMonthIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                                Начало: {formatDateTime(training!.startDate!)}
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <AccessTimeIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                                Окончание: {formatDateTime(training!.endDate!)}
                            </Typography>
                        </Stack>

                        {training?.coach?.user?.fullName && (
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <PersonIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                    Тренер: {training?.coach?.user?.fullName}
                                </Typography>
                            </Stack>
                        )}
                    </Stack>
                </Box>

                {/* Не уведомлены */}
                {unnotified.length > 0 && (
                    <Box>
                        <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            mb={1.5}
                            color="text.primary"
                        >
                            Не уведомлены • {unnotified.length}
                        </Typography>

                        <Stack spacing={1.5}>
                            {unnotified.map((n) => (
                                <Card
                                    key={n.id}
                                    variant="outlined"
                                    sx={(theme) => ({
                                        p: 2,
                                        bgcolor: theme.palette.background.paper,
                                    })}
                                >
                                    <Stack spacing={1.5}>
                                        <Typography fontWeight={600} color="text.primary">
                                            {n!.client!.user!.fullName}
                                        </Typography>

                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <PhoneIcon fontSize="small" color="action" />
                                            <Typography variant="body2" color="text.secondary">
                                                {n!.client!.user!.phoneNumber}
                                            </Typography>
                                        </Stack>

                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => onNotifyClient?.(n.id!)}
                                            sx={{
                                                mt: 0.5,
                                                textTransform: "none",
                                                fontWeight: 500,
                                            }}
                                        >
                                            Отметить как уведомленного
                                        </Button>
                                    </Stack>
                                </Card>
                            ))}
                        </Stack>
                    </Box>
                )}

                {/* Уведомлены */}
                {notified.length > 0 && (
                    <Box>
                        <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            mb={1.5}
                            color="text.secondary"
                        >
                            Уже уведомлены • {notified.length}
                        </Typography>

                        <Stack spacing={1.5}>
                            {notified.map((n) => (
                                <Card
                                    key={n.id}
                                    variant="outlined"
                                    sx={(theme) => ({
                                        p: 2,
                                        bgcolor: theme.palette.background.default,
                                        opacity: 0.9,
                                    })}
                                >
                                    <Stack spacing={1.5}>
                                        <Typography fontWeight={500} color="text.primary">
                                            {n.client!.user!.fullName}
                                        </Typography>

                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <PhoneIcon fontSize="small" color="action" />
                                            <Typography variant="body2" color="text.secondary">
                                                {n!.client!.user!.phoneNumber}
                                            </Typography>
                                        </Stack>

                                        {n.admin && (
                                            <>
                                                <Divider sx={{ my: 0.5 }} />
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                                                >
                                                    Уведомил: {n.admin.fullName} (@{n.admin.userName})
                                                </Typography>
                                            </>
                                        )}
                                    </Stack>
                                </Card>
                            ))}
                        </Stack>
                    </Box>
                )}

                {notifications!.length === 0 && (
                    <Box
                        sx={(theme) => ({
                            textAlign: "center",
                            py: 4,
                            bgcolor: theme.palette.action.hover,
                            borderRadius: 2,
                        })}
                    >
                        <Typography variant="body2" color="text.secondary">
                            На эту тренировку никто не был записан
                        </Typography>
                    </Box>
                )}
            </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button 
                onClick={onClose} 
                variant="outlined" 
                sx={{ textTransform: "none" }}
            >
                Закрыть
            </Button>
        </DialogActions>
    </Dialog>
);
}