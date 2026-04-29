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
  Dialog,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import PaymentIcon from '@mui/icons-material/Payment';
import { ClientDTO, CreatePaymentDTO, TrainingReservationDTO } from "../../api/g";
import { apiClient } from "../../api/apiClient";
import { useState } from "react";
import { PaymentForm } from "./PaymentDialog";

interface ReservationHistoryProps {
  client: ClientDTO;
  fetchClient: (showLoading: boolean) => Promise<void>;
  isAdminView: boolean;
  reservationsList: TrainingReservationDTO[];
  onReservationUpdate: (reservationId: number, updatedReservation: TrainingReservationDTO) => void;
  hideCancelled: boolean;
  setHideCancelled: (value: boolean) => void;
  hidePaid: boolean;
  setHidePaid: (value: boolean) => void;
}

export function ReservationHistory({
  client,
  fetchClient,
  isAdminView,
  reservationsList,
  onReservationUpdate,
  hideCancelled,
  setHideCancelled,
  hidePaid,
  setHidePaid,
}: ReservationHistoryProps) {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<TrainingReservationDTO | null>(null);
  const [bonuses, setBonuses] = useState<number>(0); // бонусы для оплаты
  const [paymentError, setPaymentError] = useState("");

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

  const reservations = reservationsList.filter((tr) => {
    if (hideCancelled && tr.reservationStatus!.name === "Отменена") return false;
    if (hidePaid && tr.reservationStatus!.name === "Оплачена") return false;
    return true;
  });

  const handleCancel = async (id: number) => {
    if (window.confirm(`Вы действительно хотите отменить эту запись?`)) {
      try {
        const result = await apiClient.cancelReservation(id);
        onReservationUpdate(id, result);
      }
      catch (error)
      {
        console.error("Ошибка при отмене записи " + error);
      }
    }
  }

  
  const handleGoToPayment = (reservation: TrainingReservationDTO) => {
    setSelectedReservation(reservation || null);
    setPaymentOpen(true);
  };

  const handleTrainingPayment = async () => {
    const model = new CreatePaymentDTO();
    model.cashbackPercentage = selectedReservation!.training!.cashbackPercentage;
    model.price = selectedReservation!.training!.price!;
    model.paidWithBonuses = bonuses;
    model.clientId = client!.id;
    try {
      const result = await apiClient.confirmReservationPayment(selectedReservation!.id!, model);
      await fetchClient(false);
      handleClosePaymentDialog();
    } catch (error: any) {
      setPaymentError(error.message);
    }
  }

  const handleClosePaymentDialog = () => {
    setSelectedReservation(null);
    setPaymentOpen(false);
    setBonuses(0);
    setPaymentError("");
  }

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

            const weekDay = startDate.toLocaleDateString("ru", { weekday: "long" }); // например, "понедельник"
            const dayOfWeek = weekDay.charAt(0).toUpperCase() + weekDay.slice(1);
            const dateOnly = startDate.toLocaleDateString("ru"); // например, "01.04.2026"
            const startTime = startDate.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }); // "19:00"
            const endTime = endDate.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }); // "20:00"

            // Определяем, нужно ли показывать кнопку "Перейти к оплате"
            const showPaymentButton = isAdminView && reservation.reservationStatus?.id === 2;

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
                    </Box>

                    {/* Info */}
                    <Stack direction="column" spacing={1} alignItems="left">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarTodayIcon fontSize="small" color="action" />
                        <Typography fontWeight={600}>
                            {dateOnly}
                        </Typography>
                        <Typography color="text.secondary">
                            ({dayOfWeek})
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography color="text.secondary">
                            {startTime} – {endTime}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <PersonIcon fontSize="small" color="action" />
                        <Typography color="text.secondary">
                          Тренер: {training.coach!.user!.fullName}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PersonIcon fontSize="small" color="action" />
                        <Typography color="text.secondary">
                          Цена: {training.price} ₽
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

                    {/* Action Buttons */}
                    <Stack spacing={2}>
                      {/* Кнопка отмены для статуса "Ожидание" */}
                      {reservation.reservationStatus!.name === "Ожидание" && (
                        <Button
                          fullWidth
                          variant="outlined"
                          color="error"
                          onClick={() => handleCancel(reservation.id!)}
                          startIcon={<CancelIcon />}
                        >
                          Отменить запись
                        </Button>
                      )}

                      {/* Кнопка перехода к оплате для администратора и статуса id=2 */}
                      {showPaymentButton && (
                        <Button
                          fullWidth
                          variant="outlined"
                          color="primary"
                          onClick={() => handleGoToPayment(reservation)}
                          startIcon={<PaymentIcon />}
                        >
                          Перейти к оплате
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </GridLegacy>
            );
          })
        )}
      </GridLegacy>
      {selectedReservation && (
      <Dialog open={paymentOpen} onClose={handleClosePaymentDialog} maxWidth="md" fullWidth>
        <PaymentForm
          title="Оплата тренировки"
          price={selectedReservation!.training!.price!}
          cashbackPercentage={selectedReservation!.training!.cashbackPercentage!}
          clientBonuses={client!.bonuses!}

          bonuses={bonuses}
          setBonuses={setBonuses}

          onConfirm={handleTrainingPayment}
          onBack={handleClosePaymentDialog}

          error={paymentError}

          extraInfo={
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" mb={2}>
                Детали тренировки
              </Typography>

              <GridLegacy container spacing={2}>
                <GridLegacy item xs={6}>
                  <Typography variant="caption">Тип</Typography>
                  <Typography fontWeight={600}>
                    {selectedReservation!.training!.trainingType!.name}
                  </Typography>
                </GridLegacy>

                <GridLegacy item xs={6}>
                  <Typography variant="caption">Тренер</Typography>
                  <Typography fontWeight={600}>
                    {selectedReservation!.training!.coach!.user!.fullName}
                  </Typography>
                </GridLegacy>

                <GridLegacy item xs={6}>
                  <Typography variant="caption">Дата</Typography>
                  <Typography fontWeight={600}>
                    {new Date(
                      selectedReservation!.training!.startDate!
                    ).toLocaleDateString()}
                  </Typography>
                </GridLegacy>

                <GridLegacy item xs={6}>
                  <Typography variant="caption">День недели</Typography>
                  <Typography fontWeight={600}>
                    {(() => {
                      const d = new Date(
                        selectedReservation!.training!.startDate!
                      ).toLocaleDateString("ru", { weekday: "long" });
                      return d.charAt(0).toUpperCase() + d.slice(1);
                    })()}
                  </Typography>
                </GridLegacy>

                <GridLegacy item xs={6}>
                  <Typography variant="caption">Начало</Typography>
                  <Typography fontWeight={600}>
                    {new Date(
                      selectedReservation!.training!.startDate!
                    ).toLocaleTimeString("ru", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </GridLegacy>

                <GridLegacy item xs={6}>
                  <Typography variant="caption">Окончание</Typography>
                  <Typography fontWeight={600}>
                    {new Date(
                      selectedReservation!.training!.endDate!
                    ).toLocaleTimeString("ru", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </GridLegacy>
              </GridLegacy>
            </CardContent>
          </Card>
        }
        />
      </Dialog>
    )}
    </Box>
  );
}