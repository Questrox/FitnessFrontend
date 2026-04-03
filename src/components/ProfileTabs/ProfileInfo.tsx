import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  GridLegacy,
  Stack
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import EditIcon from "@mui/icons-material/Edit";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { ClientDTO, MembershipDTO } from "../../api/g";

interface Props {
  client: ClientDTO;
  membership?: MembershipDTO
}

export function ProfileInfo({ client }: Props) {
  const currDate = new Date();
  const membership = client.memberships!.find((m) => m.startDate! <= currDate && m.endDate! >= currDate);
  return (
    <GridLegacy container spacing={4}>
      {/* Личная информация */}
      <GridLegacy item xs={12} lg={6}>
        <Card>
          <CardHeader
            title={
              <Stack direction="row" alignItems="center" spacing={1}>
                <PersonIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Личная информация
                </Typography>
              </Stack>
            }
          />

          <CardContent>
            <Stack spacing={3}>
              {/* Бонусы */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Количество бонусов
                </Typography>

                <Typography fontWeight={600} sx={{ mt: 0.5 }}>
                  {client.bonuses}
                </Typography>
              </Box>
              {/* Имя */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  ФИО
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "action.hover"
                  }}
                >
                  <Typography fontWeight={600}>
                    {client.user!.fullName}
                  </Typography>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => alert("Редактирование имени")}
                  >
                    Изменить
                  </Button>
                </Box>
              </Box>

              {/* Username */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Логин
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "action.hover"
                  }}
                >
                  <Typography fontWeight={600}>
                    @{client.user!.userName}
                  </Typography>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => alert("Редактирование логина")}
                  >
                    Изменить
                  </Button>
                </Box>
              </Box>

              {/* Телефон */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Телефон
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "action.hover"
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PhoneIcon color="action" />
                    <Typography fontWeight={600}>
                      {client.user!.phoneNumber}
                    </Typography>
                  </Stack>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => alert("Редактирование телефона")}
                  >
                    Изменить
                  </Button>
                </Box>
              </Box>

              {/* Email */}
              {/* <Box>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "action.hover"
                  }}
                >
                  <EmailIcon color="action" />
                  <Typography fontWeight={600}>
                    {client.email}
                  </Typography>
                </Box>
              </Box> */}
            </Stack>
          </CardContent>
        </Card>
      </GridLegacy>

      {/* Абонемент */}
      <GridLegacy item xs={12} lg={6}>
        <Card>
          <CardHeader
            title={
              <Stack direction="row" spacing={1} alignItems="center">
                <CreditCardIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Текущий абонемент
                </Typography>
              </Stack>
            }
          />

          <CardContent>
            {membership ? (
              <Stack spacing={3}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider"
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Тариф
                  </Typography>

                  <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                    {membership.membershipType!.name}
                  </Typography>

                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    {membership.membershipType!.description}
                  </Typography>

                  <Box sx={{ pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarTodayIcon fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        Дата окончания
                      </Typography>
                    </Stack>

                    <Typography fontWeight={700}>
                      {new Date(membership.endDate!).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            ) : (
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: "1px dashed",
                  borderColor: "divider",
                  textAlign: "center"
                }}
              >
                <Typography color="text.secondary">
                    Нет активного абонемента
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </GridLegacy>
    </GridLegacy>
  );
}