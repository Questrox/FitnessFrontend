import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  FormControlLabel,
  Stack,
  Chip,
  GridLegacy,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CancelIcon from "@mui/icons-material/Cancel";
import { MembershipDTO } from "../../api/g";

interface MembershipHistoryProps {
  memberships: MembershipDTO[];
}

export function MembershipHistory({
  memberships,
}: MembershipHistoryProps) {
  return (
    <Box>
      {/* List */}
      <Stack spacing={2}>
        {memberships.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <HistoryIcon sx={{ fontSize: 40, color: "text.disabled", mb: 2 }} />
              <Typography color="text.secondary">
                Пока что абонементов нет
              </Typography>
            </CardContent>
          </Card>
        ) : (
          memberships.map((membership) => {
            const currDate = new Date();
            const isActive = new Date(membership.startDate!).getTime() <= currDate.getTime() && new Date(membership.endDate!).getTime() >= currDate.getTime();
            const chipLabel = isActive ? "Активный" : "Истекший";

            return (
              <Card
                key={membership.id}
                sx={{
                  transition: "0.2s",
                  "&:hover": { boxShadow: 3 },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    {/* Left */}
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                        <Typography variant="h6" fontWeight={700}>
                          {membership.membershipType!.name}
                        </Typography>

                        <Chip
                          icon={isActive ? <CheckCircleIcon fontSize="small" /> : <AccessTimeIcon fontSize="small" />}
                          label={chipLabel}
                          color={isActive ? "success" : "default"}
                          variant={isActive ? "filled" : "outlined"}
                        />
                      </Stack>

                      <GridLegacy container spacing={2}>
                        <GridLegacy item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary">
                            Дата покупки
                          </Typography>
                          <Typography fontWeight={600}>
                            {new Date(membership.payment!.date!).toLocaleDateString()}
                          </Typography>
                        </GridLegacy>

                        <GridLegacy item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary">
                            Период действия
                          </Typography>
                          <Typography fontWeight={600}>
                            {new Date(membership.startDate!).toLocaleDateString()} —{" "}
                            {new Date(membership.endDate!).toLocaleDateString()}
                          </Typography>
                        </GridLegacy>
                      </GridLegacy>
                    </Box>

                    {/* Right */}
                    <Box
                      sx={{
                        textAlign: { xs: "left", md: "right" },
                        minWidth: 120,
                      }}
                    >
                      <Typography variant="h5" fontWeight={700} color="primary">
                        {membership.payment!.price} ₽
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Оплачено
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })
        )}
      </Stack>
    </Box>
  );
}