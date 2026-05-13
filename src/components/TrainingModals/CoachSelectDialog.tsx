import { Dialog, DialogTitle, DialogContent, Box, CircularProgress, GridLegacy, Card, CardContent, Typography, Stack, Chip, Avatar, Button, DialogActions, Divider } from "@mui/material";
import { useState, useEffect } from "react";
import { apiClient } from "../../api/apiClient";
import { CoachDTO, TrainingDTO } from "../../api/g";
import PersonIcon from "@mui/icons-material/Person";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (coach: CoachDTO) => Promise<void>;
  training: TrainingDTO | null;
}

export function CoachSelectDialog({
  open,
  onClose,
  onSelect,
  training,
}: Props) {
  const [coaches, setCoaches] = useState<CoachDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || !training) return;

    fetchCoaches();
  }, [open, training]);

  const fetchCoaches = async () => {
    try {
      setIsLoading(true);

      const data = await apiClient.getAvailableCoaches(
        training!.startDate!,
        training!.endDate!
      );

      setCoaches(data);
    } catch (error: any) {
      console.error(
        "Ошибка при получении тренеров:",
        error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Вспомогательная функция для склонения стажа
  const getExperienceText = (years: number) => {
    const lastDigit = years % 10;
    const lastTwoDigits = years % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return "лет";
    if (lastDigit === 1) return "год";
    if (lastDigit >= 2 && lastDigit <= 4) return "года";
    return "лет";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          fontWeight: 700,
          fontSize: "1.5rem",
        }}
      >
        Выбор тренера
      </DialogTitle>

      <DialogContent>
        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={8}
          >
            <CircularProgress size={48} />
          </Box>
        ) : coaches.length === 0 ? (
          <Card
            sx={{
              mt: 2,
              flexGrow: 1,
              borderRadius: 2,
            }}
          >
            <CardContent
              sx={{
                textAlign: "center",
                py: 6,
              }}
            >
              <PersonIcon
                sx={{
                  fontSize: 60,
                  color: "text.disabled",
                  mb: 2,
                }}
              />

              <Typography
                variant="h6"
                color="text.secondary"
                gutterBottom
              >
                Нет свободных тренеров
              </Typography>

              <Typography
                variant="body2"
                color="text.disabled"
              >
                На выбранное время все тренеры заняты
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <GridLegacy container spacing={2.5}>
            {coaches.map((coach) => (
              <GridLegacy
                item
                xs={12}
                md={6}
                key={coach.id}
              >
                <Card
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    border: "1px solid",
                    borderColor: "divider",
                    position: "relative",
                    overflow: "hidden",

                    "&:hover": {
                      boxShadow: 3,
                    },
                  }}
                  onClick={() => onSelect(coach)}
                >
                  <CardContent
                    sx={{
                      p: 2.5,
                      "&:last-child": { pb: 2.5 },
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                    >
                      <Avatar
                        sx={{
                          width: 70,
                          height: 70,
                          bgcolor: "primary.light",
                        }}
                        src={coach.photoPath}
                      >
                        <PersonIcon />
                      </Avatar>

                      <Box>
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          sx={{ lineHeight: 1.3 }}
                        >
                          {coach.user?.fullName}
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ mt: 0.5 }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Стаж: {coach.experience}{" "}
                            {getExperienceText(coach.experience!)}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </GridLegacy>
            ))}
          </GridLegacy>
        )}
      </DialogContent>
      <Divider/>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          size="medium"
        >
          Отмена
        </Button>
      </DialogActions>
    </Dialog>
  );
}