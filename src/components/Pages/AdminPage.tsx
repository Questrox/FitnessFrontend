import { useState } from "react";
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
import { MembershipManagement } from "../AdminTabs/MembershipManagement";

type TabType = "memberships" | "trainingTypes" | "clients";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("memberships");

  const tabs = [
    { id: "memberships", label: "Абонементы", icon: <CreditCardIcon /> },
    { id: "trainingTypes", label: "Тренировки", icon: <FitnessCenterIcon /> },
    { id: "clients", label: "Клиенты", icon: <PeopleIcon /> },
  ];

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
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          sx={{ mb: 3 }}
          variant="scrollable"
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              value={tab.id}
              icon={tab.icon}
              iconPosition="start"
              label={tab.label}
            />
          ))}
        </Tabs>

        {/* Content */}
        {activeTab === "memberships" && <MembershipManagement />}
        {activeTab === "trainingTypes" && <Typography>Здесь должны быть типы тренировок</Typography>}
        {activeTab === "clients" && <Typography>Здесь должны быть клиенты</Typography>}
      </Container>
    </Box>
  );
};

export default AdminPage;