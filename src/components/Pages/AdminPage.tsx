import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab
} from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import PeopleIcon from "@mui/icons-material/People";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';

const AdminPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // определяем активный таб по URL
  const currentTab = (() => {
    if (location.pathname.includes("/training-types")) return "trainingTypes";
    if (location.pathname.includes("/clients")) return "clients";
    if (location.pathname.includes("memberships")) return "memberships";
    if (location.pathname.includes("notifications")) return "notifications";
    if (location.pathname.includes("coaches")) return "coaches";
    return "";
  })();

  const handleChange = (_: any, value: string) => {
    switch (value) {
      case "memberships":
        navigate("/admin/memberships");
        break;
      case "trainingTypes":
        navigate("/admin/training-types");
        break;
      case "clients":
        navigate("/admin/clients");
        break;
      case "notifications":
        navigate("/admin/notifications");
        break;
      case "coaches":
        navigate("/admin/coaches");
        break;
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 6 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "primary.main",
                display: "flex"
              }}
            >
              <ShieldIcon sx={{ color: "primary.contrastText", fontSize: 40 }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Панель администратора
              </Typography>
              <Typography color="text.secondary">
                Управление абонементами, тренировками и клиентами
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs
          value={currentTab}
          onChange={handleChange}
          sx={{ mb: 3 }}
          variant="scrollable"
        >
          <Tab value="memberships" icon={<CreditCardIcon />} iconPosition="start" label="Абонементы" />
          <Tab value="trainingTypes" icon={<FitnessCenterIcon />} iconPosition="start" label="Тренировки" />
          <Tab value="clients" icon={<PeopleIcon />} iconPosition="start" label="Клиенты" />
          <Tab value="coaches" icon={<SportsBaseballIcon />} iconPosition="start" label="Тренеры" />
          <Tab value="notifications" icon={<NotificationsNoneIcon />} iconPosition="start" label="Уведомления" />
        </Tabs>

        {/* Контент теперь через роутер */}
        <Outlet />
      </Container>
    </Box>
  );
};

export default AdminPage;