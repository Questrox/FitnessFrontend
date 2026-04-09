import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  FormControlLabel,
  Stack,
  GridLegacy,
  Chip,
  Button,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import { TrainingReservationDTO } from "../../api/g";

interface ReservationHistoryProps {
  reservations: TrainingReservationDTO[];
  hideCancelled: boolean;
  setHideCancelled: (value: boolean) => void;
  hidePaid: boolean;
  setHidePaid: (value: boolean) => void;
}

export function ReservationHistory({
  reservations,
  hideCancelled,
  setHideCancelled,
  hidePaid,
  setHidePaid,
}: ReservationHistoryProps) {
  const statusLabels = {
    "Ожидание": "pending",
    "Посещена": "visited",
    "Оплачена": "paid",
    "Отменена": "cancelled",
  } as const;

  const statusConfig = {
    pending: {
    color: "warning" as const,
    icon: <AccessTimeIcon fontSize="small" />,
    },
    visited: {
    color: "info" as const,
    icon: <CheckCircleIcon fontSize="small" />,
    },
    paid: {
    color: "success" as const,
    icon: <CheckCircleIcon fontSize="small" />,
    },
    cancelled: {
    color: "error" as const,
    icon: <CancelIcon fontSize="small" />,
    },
  } as const;

  type LabelKey = keyof typeof statusLabels;

  return (
    <Box>
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <FilterListIcon color="action" />
            <Typography variant="h6">Фильтры</Typography>
          </Stack>

          <Stack direction="row" spacing={2} flexWrap="wrap">
            <FormControlLabel
              control={
                <Checkbox
                  checked={hideCancelled}
                  onChange={(e) => setHideCancelled(e.target.checked)}
                />
              }
              label="Скрыть отменённые"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={hidePaid}
                  onChange={(e) => setHidePaid(e.target.checked)}
                />
              }
              label="Скрыть оплаченные"
            />
          </Stack>
        </CardContent>
      </Card>

      {/* List */}
      <GridLegacy container spacing={3}>
        {reservations.length === 0 ? (
          <GridLegacy item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: "center", py: 6 }}>
                <FitnessCenterIcon
                  sx={{ fontSize: 40, color: "text.disabled", mb: 2 }}
                />
                <Typography color="text.secondary">
                  Нет записей на тренировки с текущими фильтрами
                </Typography>
              </CardContent>
            </Card>
          </GridLegacy>
        ) : (
          reservations.map((reservation) => {
            const statusKey = statusLabels[reservation.reservationStatus!.name as LabelKey];
            const config = statusConfig[statusKey];
            const training = reservation.training!;

            const startDate = new Date(training.startDate!);
            const endMs = new Date(startDate).getTime() + training.trainingType!.duration! * 60 * 1000;
            const endDate = new Date(endMs);

            const dayOfWeek = startDate.toLocaleDateString("ru", { weekday: "long" }); // например, "понедельник"
            const dateOnly = startDate.toLocaleDateString("ru"); // например, "01.04.2026"
            const startTime = startDate.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }); // "19:00"
            const endTime = endDate.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }); // "20:00"

            return (
              <GridLegacy item xs={12} md={6} key={reservation.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "0.2s",
                    "&:hover": { boxShadow: 3 },
                  }}
                >
                  <CardContent sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    {/* Header */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="h6" fontWeight={700} mb={1}>
                          {reservation.training!.trainingType!.name}
                        </Typography>

                        <Chip
                          icon={config.icon}
                          label={reservation.reservationStatus!.name}
                          color={config.color}
                          variant={"filled"}
                        />
                      </Box>

                      <Typography variant="h6" fontWeight={700} color="primary">
                        ${reservation.payment?.price}
                      </Typography>
                    </Box>

                    {/* Info */}
                    <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarTodayIcon fontSize="small" color="action" />
                        <Typography fontWeight={600}>
                            {dayOfWeek}
                        </Typography>
                        <Typography color="text.secondary">
                            {dateOnly}
                        </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography color="text.secondary">
                            {startTime} – {endTime}
                        </Typography>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <PersonIcon fontSize="small" color="action" />
                        <Typography color="text.secondary">
                          Тренер: {training.coach!.user!.fullName}
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Footer */}
                    <Box
                      sx={{
                        mt: 2,
                        pt: 2,
                        borderTop: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      {/* <Typography variant="caption" color="text.secondary">
                        Забронировано:{" "}
                        {new Date(reservation.bookingDate).toLocaleDateString()}
                      </Typography> */}
                    </Box>

                    {/* Action */}
                    {reservation.reservationStatus!.name === "Ожидание" && (
                      <Box sx={{ mt: 2 }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="error"
                          onClick={() =>
                            alert(
                              "Функционал отмены бронирования будет реализован здесь"
                            )
                          }
                          startIcon={<CancelIcon />}
                        >
                          Отменить запись
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </GridLegacy>
            );
          })
        )}
      </GridLegacy>
    </Box>
  );
}