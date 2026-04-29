import { DialogTitle, Stack, Button, Typography, DialogContent, Card, CardContent, Box, TextField, DialogActions } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface PaymentFormProps {
  title?: string;
  price: number;
  cashbackPercentage: number;
  clientBonuses: number;

  bonuses: number;
  setBonuses: (v: number) => void;

  onConfirm: () => void;
  onBack?: () => void;

  extraInfo?: React.ReactNode; // верхняя часть диалога, показывает детали покупки
  error?: string | null;
}

export function PaymentForm({
  title = "Оплата",
  price,
  cashbackPercentage,
  clientBonuses,
  bonuses,
  setBonuses,
  onConfirm,
  onBack,
  extraInfo,
  error,
}: PaymentFormProps) {
  const finalPrice = price - bonuses;
  const cashback = (price / 100) * cashbackPercentage;

  return (
    <>
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          {onBack && (
            <Button size="small" onClick={onBack}>
              <ArrowBackIcon />
            </Button>
          )}
          <Typography variant="h6">{title}</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Доп. информация (разная для разных сценариев) */}
          {extraInfo}

          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" mb={2}>
                Оплата
              </Typography>

              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Цена</Typography>
                  <Typography fontWeight={600}>{price}</Typography>
                </Box>

                <TextField
                  label={`Бонусы (доступно: ${clientBonuses})`}
                  type="number"
                  value={bonuses}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const value = raw === "" ? 0 : Number(raw);
                    setBonuses(Math.max(0, Math.min(value, clientBonuses, price)));
                  }}
                />

                <Button onClick={() => setBonuses(Math.min(clientBonuses, price))}>
                  Использовать все бонусы
                </Button>

                <Box display="flex" justifyContent="space-between">
                  <Typography>Начислится бонусов</Typography>
                  <Typography>{cashback}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography>Скидка</Typography>
                  <Typography>-{bonuses}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6">Итого</Typography>
                  <Typography variant="h6">{finalPrice}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {error && <Typography color="error">{error}</Typography>}
        </Stack>
      </DialogContent>

      <DialogActions>
        {onBack && <Button onClick={onBack}>Назад</Button>}
        <Button variant="contained" onClick={onConfirm}>
          Подтвердить оплату
        </Button>
      </DialogActions>
    </>
  );
}