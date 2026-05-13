import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { ReservationForTrainingDTO, TrainingDTO } from "../../api/g";
import { useAuth } from "../../context/AuthContext";

interface TrainingAttendanceListProps {
  training: TrainingDTO;
  reservations: ReservationForTrainingDTO[] | null;
  onConfirmAttendance: (reservationId: number) => Promise<void>;
  onMarkCompleted: () => Promise<void>;
}

export function TrainingAttendanceList({
  training,
  reservations,
  onConfirmAttendance,
  onMarkCompleted,
}: TrainingAttendanceListProps) {

  const { userRole, user } = useAuth();
  
  if (!reservations)
    return <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 150 }}>
              <CircularProgress size={60} />
            </Box>
  
  const confirmedCount = reservations.filter((r) => r.reservationStatusId === 2).length;
  const totalCount = reservations.length;

  return (
    <Stack>
      {/* Сводка */}
      {training.trainingStatusId !== 3 && 
        <Box
          sx={{
            bgcolor: "action.hover",
            borderRadius: 2,
            p: 2,
            border: "1px solid",
            borderColor: "divider",
            mb: 3
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Отмеченных клиентов:{" "}
            <Typography component="span" fontWeight={600} color="text.primary">
              {confirmedCount} / {totalCount}
            </Typography>{" "}
          </Typography>
        </Box>
      }

      {/* Список клиентов */}
      {reservations.length > 0 ? (
        <Box sx={{ maxHeight: 400, overflowY: "auto"}}>
          <Stack spacing={2}>
            {reservations.slice() // чтобы не мутировать исходный массив
                .sort((a, b) => {
                    const aConfirmed = a.reservationStatusId === 2;
                    const bConfirmed = b.reservationStatusId === 2;

                    return Number(aConfirmed) - Number(bConfirmed);
                }).map((res) => (
              <Card key={res.id}>
                <CardContent sx={{border: "1px solid", borderColor: "divider", borderRadius: "2px" }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    {/* Инфо */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        mb={0.5}
                      >
                        <Typography fontWeight={600}>
                          {res.user!.fullName}
                        </Typography>
                      </Stack>

                      <Typography variant="body2" color="text.secondary" mb={1}>
                        @{res.user!.userName}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {res.user!.phoneNumber}
                      </Typography>
                    </Box>

                    {/* Кнопка */}
                    {training.trainingStatusId !== 3 &&
                      <Button
                        size="small"
                        variant={
                          res.reservationStatusId === 2 ? "outlined" : "outlined"
                        }
                        color={
                          res.reservationStatusId === 2 ? "inherit" : "primary"
                        }
                        onClick={() => onConfirmAttendance(res.id!)}
                        disabled={res.reservationStatusId === 2 || userRole !== "Coach" || training.trainingStatusId !== 1 || training.coach?.userId !== user?.userId}
                      >
                        {res.reservationStatusId === 2
                          ? "Посещение отмечено"
                          : res.reservationStatusId === 5 ? "Клиент не пришел" : "Отметить посещение"}
                      </Button>
                    }
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      ) : (
        <Box textAlign="center" py={6}>
          <Typography color="text.secondary">
            Нет записанных клиентов
          </Typography>
        </Box>
      )}

      {/* Завершение тренировки */}
      {reservations.length > 0 && (
        <Box pt={2} borderTop="1px solid" borderColor="divider">
          <Button
            fullWidth
            variant="contained"
            color="success"
            disabled={userRole !== "Coach" || training.trainingStatusId !== 1 || training.coach?.userId !== user?.userId}
            onClick={onMarkCompleted}
          >
            {training.trainingStatusId === 1 ? "Завершить тренировку" : training.trainingStatusId === 2 ? "Тренировка проведена" : "Тренировка отменена"}
          </Button>
        </Box>
      )}
    </Stack>
  );
}