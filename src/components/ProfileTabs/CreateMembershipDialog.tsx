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
import { useState } from "react";
import { ClientDTO, CreateMembershipDTO, MembershipTypeDTO } from "../../api/g";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { apiClient } from "../../api/apiClient";
import { PaymentForm } from "./PaymentDialog";

interface CreateMembershipDialogProps {
  open: boolean;
  onClose: () => void;
  membershipTypes: MembershipTypeDTO[];
  selectedClient: ClientDTO;
  error: string | null;
  setError: (str: string) => void;
  onSuccess: () => void;
}

export const CreateMembershipDialog = ({
  open,
  onClose,
  membershipTypes,
  selectedClient,
  error,
  setError,
  onSuccess
}: CreateMembershipDialogProps) => {
  const [step, setStep] = useState<"create" | "confirm">("create");
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [selectedMembershipType, setSelectedMembershipType] = useState<MembershipTypeDTO | null>(null);
  const [bonuses, setBonuses] = useState<number>(0);

  const calculateEndDate = () => {
    if (!selectedMembershipType || !startDate) return new Date();

    const date = new Date(startDate.toISOString());
    date.setMonth(date.getMonth() + selectedMembershipType.duration!);
    return date;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMembershipType)
    {
      setError("Необходимо выбрать тип абонемента");
      return;
    }
    if (!startDate)
    {
      setError("Необходимо ввести дату");
      return;
    }
    if (startDate.startOf('day').isBefore(dayjs().startOf('day'))) 
    {
      setError("Дата начала должна быть не раньше текущего дня");
      return;
    }

    setError("");
    setStep("confirm");
  };

  const handleConfirm = async () => {
    try {
      const dto = new CreateMembershipDTO();
      dto.clientId = selectedClient.id;
      dto.membershipTypeId = selectedMembershipType!.id;
      dto.paidWithBonuses = bonuses;
      dto.startDate = startDate!.toDate();
      const data = await apiClient.addMembership(dto);
      await onSuccess();
      handleClose();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleClose = () => {
    onClose();
    setStep("create");
    setStartDate(dayjs());
    setBonuses(0);
    setSelectedMembershipType(null);
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      {/* ШАГ 1 */}
      {step === "create" && (
        <>
          <DialogTitle>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button size="small" onClick={handleClose}>
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
                  getOptionLabel={(option) => `${option.name} (${option.price}₽, ${option.cashbackPercentage}% кэшбека, ${option.duration} мес.)`}
                  onChange={(_, value) => setSelectedMembershipType(value!)}
                  renderInput={(params) => (
                    <TextField {...params} label="Тип абонемента" required />
                  )}
                  value={selectedMembershipType}
                />

                {/* Date */}
                <DatePicker
                    label="Дата начала"
                    value={startDate}
                    onChange={setStartDate}
                    minDate={dayjs()}
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
            <Button onClick={handleClose}>Отмена</Button>
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
      <PaymentForm
        title="Подтверждение оплаты абонемента"
        price={selectedMembershipType.price!}
        cashbackPercentage={selectedMembershipType.cashbackPercentage!}
        clientBonuses={selectedClient.bonuses!}

        bonuses={bonuses}
        setBonuses={setBonuses}

        onConfirm={handleConfirm}
        onBack={() => setStep("create")}

        extraInfo={
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
        }
        error={error}
      />)}
    </Dialog>
  );
};