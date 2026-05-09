import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GroupIcon from "@mui/icons-material/Group";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import { Link as RouterLink } from "react-router-dom";
import { TrainingTypeDTO } from "../../api/g";

interface TrainingTypeDetailsDialogProps {
  open: boolean;
  training: TrainingTypeDTO | null;
  onClose: () => void;
}

export const TrainingTypeDetailsDialog = ({
  open,
  training,
  onClose,
}: TrainingTypeDetailsDialogProps) => {
  const theme = useTheme();

  if (!training) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          p: 0,
          position: "relative",
        }}
      >
        <Box
          sx={{
            height: 280,
            position: "relative",
          }}
        >
          <Box
            component="img"
            src={training.photoPath}
            alt={training.name}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(
                to top,
                rgba(0,0,0,0.7),
                rgba(0,0,0,0.1)
              )`,
            }}
          />

          <Box
            sx={{
              position: "absolute",
              bottom: 24,
              left: 24,
              right: 24,
              color: "white",
            }}
          >
            <Typography variant="h3" fontWeight={800}>
              {training.name}
            </Typography>
          </Box>

          <Button
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              minWidth: 0,
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.15)",
              color: "white",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.25)",
              },
            }}
          >
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 4, mt: 3 }}>
        <Typography
          color="text.secondary"
          sx={{
            lineHeight: 1.9,
            mb: 4,
            fontSize: "1rem",
          }}
        >
          {training.description}
        </Typography>

        <Stack spacing={2}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.06),
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <GroupIcon color="primary" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Формат тренировки
                </Typography>
                <Typography fontWeight={700}>
                  {training.maxClients === 1
                    ? "Персональная тренировка"
                    : `До ${training.maxClients} участников`}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.secondary.main, 0.06),
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <AccessTimeIcon color="secondary" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Продолжительность
                </Typography>
                <Typography fontWeight={700}>
                  {training.duration} мин.
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.success.main, 0.06),
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <MonetizationOnIcon color="success" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Стоимость
                </Typography>
                <Typography fontWeight={800} fontSize="1.2rem">
                  {training.price} ₽
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.warning.main, 0.08),
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <WorkspacePremiumIcon
                sx={{ color: theme.palette.warning.main }}
              />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Кэшбек бонусами
                </Typography>
                <Typography fontWeight={700} color="warning.main">
                  {training.cashbackPercentage}%
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 4 }} />

        <Typography color="text.secondary" textAlign="center">
          {training?.maxClients! > 1 ? "Подробности по записи и доступному времени можно посмотреть в расписании клуба." 
          : "Для записи на персональную тренировку обратитесь к администратору или к тренеру."}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 4 }}>
        <Button onClick={onClose} variant="outlined">
          Закрыть
        </Button>

        <Button
          component={RouterLink}
          to="/schedule"
          variant="contained"
          startIcon={<FitnessCenterIcon />}
          onClick={() => {onClose(); window.scrollTo({ top: 0, behavior: "smooth" })}}
        >
          Перейти к расписанию
        </Button>
      </DialogActions>
    </Dialog>
  );
};