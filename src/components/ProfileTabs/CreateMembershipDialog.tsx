import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  GridLegacy,
  Card,
  CardContent,
  Stack
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useState } from "react";
import { ClientDTO, MembershipTypeDTO } from "../../api/g";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";

interface CreateMembershipDialogProps {
  open: boolean;
  onClose: () => void;
  membershipTypes: MembershipTypeDTO[];
  selectedClient: ClientDTO;
  error: string | null;
  setError: (str: string) => void;
}

export const CreateMembershipDialog = ({
  open,
  onClose,
  membershipTypes,
  selectedClient,
  error,
  setError
}: CreateMembershipDialogProps) => {
  const [step, setStep] = useState<"create" | "confirm">("create");
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());

  const [membershipFormData, setMembershipFormData] = useState({
    membershipId: "",
    bonuses: "0",
    availableBonuses: 100, // заглушка
  });

  const selectedMembershipType = membershipTypes.find(
    (m) => m.id === parseInt(membershipFormData.membershipId)
  );

  const calculateEndDate = () => {
    if (!selectedMembershipType || !startDate) return new Date();

    const date = new Date(startDate.toISOString());
    date.setMonth(date.getMonth() + selectedMembershipType.duration!);
    return date;
  };

  const calculateFinalPrice = () => {
    if (!selectedMembershipType) return 0;
    return (
      selectedMembershipType.price! - (parseFloat(membershipFormData.bonuses) || 0)
    );
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (membershipFormData.membershipId === "")
    {
        setError("Необходимо выбрать тип абонемента");
        return;
    }
    setError("");
    setStep("confirm");
  };

  const handleConfirm = () => {
    alert("Оплата подтверждена");
    setError("");
    onClose();
    setStep("create");
  };

  const handleSpendAllBonuses = () => {
    setMembershipFormData((prev) => ({
      ...prev,
      bonuses: prev.availableBonuses.toString(),
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* ШАГ 1 */}
      {step === "create" && (
        <>
          <DialogTitle>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button size="small" onClick={onClose}>
                <ArrowBackIcon />
              </Button>
              <Typography variant="h6">
                Оформление абонемента для клиента {selectedClient!.user!.fullName}
              </Typography>
            </Stack>
          </DialogTitle>

          <DialogContent>
            <Box component="form" onSubmit={handleNext}>
              <Stack spacing={3} mt={1}>
                {/* Autocomplete */}
                <Autocomplete
                  options={membershipTypes}
                  getOptionLabel={(option) => `${option.name} (${option.price}₽, ${option.cashbackPercentage}% кэшбека, ${option.duration} мес.)`
  }
                  onChange={(_, value) =>
                    setMembershipFormData((prev) => ({
                      ...prev,
                      membershipId: value?.id!.toString() || "",
                    }))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Тип абонемента" required />
                  )}
                />

                {/* Date */}
                <DatePicker
                    label="Дата начала"
                    value={startDate}
                    onChange={setStartDate}
                    slotProps={{
                    textField: {
                        fullWidth: true,
                        required: true,
                    },
                    }}
                />
              </Stack>
              {error && <Typography color="error" marginTop={1}>{error}</Typography>}
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => {setError(""); onClose();}}>Отмена</Button>
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ChevronRightIcon />}
            >
              Далее
            </Button>
          </DialogActions>
        </>
      )}

      {/* ШАГ 2 */}
      {step === "confirm" && selectedMembershipType && (
        <>
          <DialogTitle>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button size="small" onClick={() => setStep("create")}>
                <ArrowBackIcon />
              </Button>
              <Typography variant="h6">
                Подтверждение оплаты
              </Typography>
            </Stack>
          </DialogTitle>

          <DialogContent>
            <Stack spacing={3}>
              {/* Membership Info */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" mb={2}>
                    Детали абонемента
                  </Typography>

                  <GridLegacy container spacing={2}>
                    <GridLegacy item xs={6}>
                      <Typography variant="caption">Тип</Typography>
                      <Typography fontWeight={600}>
                        {selectedMembershipType.name}
                      </Typography>
                    </GridLegacy>

                    <GridLegacy item xs={6}>
                      <Typography variant="caption">Длительность</Typography>
                      <Typography fontWeight={600}>
                        {selectedMembershipType.duration} мес.
                      </Typography>
                    </GridLegacy>

                    <GridLegacy item xs={6}>
                      <Typography variant="caption">Начало</Typography>
                      <Typography fontWeight={600}>
                        {new Date(
                          startDate!.toISOString()
                        ).toLocaleDateString()}
                      </Typography>
                    </GridLegacy>

                    <GridLegacy item xs={6}>
                      <Typography variant="caption">Окончание</Typography>
                      <Typography fontWeight={600}>
                        {calculateEndDate().toLocaleDateString()}
                      </Typography>
                    </GridLegacy>
                  </GridLegacy>
                </CardContent>
              </Card>

              {/* Payment */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" mb={2}>
                    Оплата
                  </Typography>

                  <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Цена</Typography>
                      <Typography fontWeight={600}>
                        {selectedMembershipType.price}
                      </Typography>
                    </Box>

                    <TextField
                      label={`Бонусы (доступно: ${membershipFormData.availableBonuses})`}
                      type="number"
                      value={membershipFormData.bonuses}
                      onChange={(e) =>
                        setMembershipFormData((prev) => ({
                          ...prev,
                          bonuses: e.target.value,
                        }))
                      }
                    />

                    <Button onClick={handleSpendAllBonuses}>
                      Использовать все бонусы
                    </Button>

                    <Box display="flex" justifyContent="space-between">
                      <Typography>Скидка</Typography>
                      <Typography>
                        -{membershipFormData.bonuses}
                      </Typography>
                    </Box>

                    <Box
                      display="flex"
                      justifyContent="space-between"
                      mt={1}
                    >
                      <Typography variant="h6">
                        Итого
                      </Typography>
                      <Typography variant="h6">
                        {calculateFinalPrice()}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setStep("create")}>
              Назад
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              startIcon={<CreditCardIcon />}
            >
              Подтвердить оплату
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};