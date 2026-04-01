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

type TabType = "profile" | "memberships" | "classes";

const ProfilePage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  
  const [client, setClient] = useState<ClientDTO | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hideCancelledMemberships, setHideCancelledMemberships] = useState(false);
  const [hideExpiredMemberships, setHideExpiredMemberships] = useState(false);
  const [hideCancelledClasses, setHideCancelledClasses] = useState(false);
  const [hideCompletedClasses, setHideCompletedClasses] = useState(false);
  const [membership, setMembership] = useState<MembershipDTO | undefined>();
  const [daysUntilExpiration, setDaysUntilExpiration] = useState<number>(0);

  useEffect(() => {
    fetchClient();
  }, [id])
      
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
      setMembership(currMembership);
      if (currMembership) {
        const diffDays = Math.floor(Math.abs(currMembership!.endDate!.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
        setDaysUntilExpiration(diffDays);
      }
    } catch (error) {
      console.error("Ошибка при загрузке клиента:", error)
    }
    setIsLoading(false);
  }
//   const currentMembership = memberships.find(m => m.id === userProfile.currentMembership);

//   const daysUntilExpiration = Math.ceil(
//     (new Date(userProfile.membershipExpiration).getTime() - new Date(2026, 2, 21).getTime()) /
//     (1000 * 60 * 60 * 24)
//   );

//   const filteredMemberships = purchasedMemberships.filter((pm) => {
//     if (hideCancelledMemberships && pm.status === "cancelled") return false;
//     if (hideExpiredMemberships && pm.status === "expired") return false;
//     return true;
//   });

//   const filteredClasses = bookedClasses.filter((bc) => {
//     if (hideCancelledClasses && bc.status === "cancelled") return false;
//     if (hideCompletedClasses && bc.status === "completed") return false;
//     return true;
//   });

//   const getMembershipById = (id: string) => memberships.find(m => m.id === id);
//   const getTrainingById = (id: string) => trainings.find(t => t.id === id);
//   const getTrainingTypeById = (id: string) => trainingTypes.find(tt => tt.id === id);
//   const getCoachById = (id: string) => coaches.find(c => c.id === id);

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
              {membership && 
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
          <Tab value="classes" icon={<FitnessCenterIcon />} iconPosition="start" label="Тренировки" />
        </Tabs>

        {/* Content */}
        {activeTab === "profile" && <ProfileInfo client={client} membership={membership} />}
        {activeTab === "memberships" && <MembershipHistory memberships={client.memberships!} 
                                                           hideCancelled={hideCancelledMemberships} 
                                                           setHideCancelled={setHideCancelledMemberships}
                                                           hideExpired={hideExpiredMemberships}
                                                           setHideExpired={setHideExpiredMemberships}
         />}
        {activeTab === "classes" && (
            <Typography>Я вкладка с записями!</Typography>
        )}
      </Container>
    </Box>
  );
}

export default ProfilePage;