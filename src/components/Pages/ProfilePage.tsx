import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Avatar,
  Chip,
  CircularProgress
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import { ClientDTO, MembershipDTO } from "../../api/g";
import { apiClient } from "../../api/apiClient";
import { useParams } from "react-router-dom";
import { ProfileInfo } from "../ProfileTabs/ProfileInfo";
import { MembershipHistory } from "../ProfileTabs/MembershipHistory";
import { ReservationHistory } from "../ProfileTabs/ReservationHistory";

type TabType = "profile" | "memberships" | "classes";

const ProfilePage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  
  const [client, setClient] = useState<ClientDTO | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hideCancelledClasses, setHideCancelledClasses] = useState(false);
  const [hidePaidClasses, setHidePaidClasses] = useState(false);
  const [currentMembership, setCurrentMembership] = useState<MembershipDTO | undefined>();
  const [daysUntilExpiration, setDaysUntilExpiration] = useState<number>(0);

  useEffect(() => {
    fetchClient();
  }, [])
      
  const fetchClient = async () => {
    const currDate = new Date();
    try {
      let data : ClientDTO | undefined;
      console.log(id);
      if (id) {
        data = await apiClient.getClientById(parseInt(id));
      } else {
        data = await apiClient.getCurrentClient();
      }
      setClient(data);
      const currMembership = data!.memberships!.find((m) => m.startDate! <= currDate && m.endDate! >= currDate);
      setCurrentMembership(currMembership);
      if (currMembership) {
        const diffDays = Math.floor(Math.abs(currMembership!.endDate!.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
        setDaysUntilExpiration(diffDays);
      }
    } catch (error) {
      console.error("Ошибка при загрузке клиента:", error)
    }
    setIsLoading(false);
  }
  const filteredReservations = client?.trainingReservations!.filter((tr) => {
    if (hideCancelledClasses && tr.reservationStatus!.name === "Отменена") return false;
    if (hidePaidClasses && tr.reservationStatus!.name === "Оплачена") return false;
    return true;
  });
  if (isLoading)
    return <CircularProgress/>;

  if (!client)
    return <Typography>Не удалось получить клиента</Typography>

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 6 }}>
      <Container maxWidth="lg">

        {/* Header */}
        <Card sx={{ mb: 4, overflow: "hidden" }}>
          <Box
            sx={{
              height: 120,
              bgcolor: "primary.main"
            }}
          />

          <CardContent sx={{ mt: -8 }}>
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "flex-end" }}>
              {/* Info */}
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" fontWeight={700}>
                  {client.user!.fullName}
                </Typography>

                <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", mt: 1 }}>
                  <Typography color="text.secondary">
                    @{client.user!.userName}
                  </Typography>
                </Box>
              </Box>

              {/* Expiration */}
              {currentMembership && 
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Текущий абонемент истекает через
                </Typography>
                <Typography variant="h5" fontWeight={700} color="primary">
                  {daysUntilExpiration} дн.
                </Typography>
              </Box>
            }
            </Box>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ mb: 3 }}
        >
          <Tab value="profile" icon={<PersonIcon />} iconPosition="start" label="Профиль" />
          <Tab value="memberships" icon={<CreditCardIcon />} iconPosition="start" label="Абонементы" />
          <Tab value="classes" icon={<FitnessCenterIcon />} iconPosition="start" label="Записи" />
        </Tabs>

        {/* Content */}
        {activeTab === "profile" && <ProfileInfo client={client} membership={currentMembership} />}
        {activeTab === "memberships" && <MembershipHistory memberships={client.memberships!} />}
        {activeTab === "classes" && <ReservationHistory reservations={filteredReservations!} 
                                                        hideCancelled={hideCancelledClasses} 
                                                        setHideCancelled={setHideCancelledClasses}
                                                        hidePaid={hidePaidClasses}
                                                        setHidePaid={setHidePaidClasses} />}
      </Container>
    </Box>
  );
}

export default ProfilePage;