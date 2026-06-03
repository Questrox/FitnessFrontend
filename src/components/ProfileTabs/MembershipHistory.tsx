import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  GridLegacy,
  Pagination,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { MembershipDTO } from "../../api/g";
import { useRef, useState } from "react";

interface MembershipHistoryProps {
  memberships: MembershipDTO[];
}

export function MembershipHistory({
  memberships,
}: MembershipHistoryProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState<number>(1);
  const pageSize = 5;
  const paginatedMemberships = memberships.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  return (
    <Box>
      {/* List */}
      <Stack spacing={2} ref={listRef}>
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
          paginatedMemberships.map((membership) => {
            const currDate = new Date();
            const isActive = new Date(membership.startDate!).getTime() <= currDate.getTime() && new Date(membership.endDate!).getTime() >= currDate.getTime();
            const isFuture = new Date(membership.startDate!).getTime() >= currDate.getTime()
            const chipLabel = isActive ? "Активный" : isFuture ? "Предстоящий" : "Истекший";

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
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          count={Math.ceil(memberships.length / pageSize)}
          page={page}
          onChange={(e, value) => {
          setPage(value);

          listRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }}
        color="primary"
          />
      </Box>
    </Box>
  );
}