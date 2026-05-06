import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Button
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import { ClientDTO, MembershipDTO, MembershipTypeDTO, TrainingReservationDTO, UserDTO } from "../../api/g";
import { apiClient } from "../../api/apiClient";
import { useParams, useSearchParams } from "react-router-dom";
import { ProfileInfo } from "../ProfileTabs/ProfileInfo";
import { MembershipHistory } from "../ProfileTabs/MembershipHistory";
import { ReservationHistory } from "../ProfileTabs/ReservationHistory";
import { CreateMembershipDialog } from "../ProfileTabs/CreateMembershipDialog";
import { CredentialsPrint } from "../AdminTabs/CredentialsPrint";
import { useAuth } from "../../context/AuthContext";

const ProfilePage = () => {
  const { id } = useParams();
  const { userRole } = useAuth();

  // управление вкладками
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [client, setClient] = useState<ClientDTO | undefined>();
  const [user, setUser] = useState<UserDTO | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hideCancelledClasses, setHideCancelledClasses] = useState(false);
  const [hidePaidClasses, setHidePaidClasses] = useState(false);
  const [currentMembership, setCurrentMembership] = useState<MembershipDTO | undefined>();
  const [daysUntilExpiration, setDaysUntilExpiration] = useState<number>(0);
  const [openMembershipDialog, setOpenMembershipDialog] = useState(false);
  const [membershipTypes, setMembershipTypes] = useState<MembershipTypeDTO[]>([]);
  const [membershipDialogError, setMembershipDialogError] = useState<string | null>("");

  const [credentials, setCredentials] = useState<{
      username: string;
      password: string;
    } | null>(null);

  // для сохранения выбранной вкладки
  useEffect(() => {
    if (activeTab !== searchParams.get("tab")) {
      setSearchParams({ tab: activeTab });
    }
  }, [activeTab, searchParams, setSearchParams]);

  useEffect(() => {
    fetchData();
  }, [])
      
  const fetchData = async () => {
    if (id || userRole === "User")
    {
      await fetchClient();
      try {
        const types = await apiClient.getMembershipTypes();
        setMembershipTypes(types || []);
      } catch (error) {
        console.error("Ошибка при загрузке типов абонементов", error);
      }
    }
    else
    {
      try {
        const data = await apiClient.getCurrentUser();
        setUser(data);
      } catch (error: any) {
        console.error("Ошибка при загрузке текущего пользователя: ", error.message);
      }
      setIsLoading(false);
    }
  }

  const fetchClient = async (showLoading = true) => {
    if (showLoading)
      setIsLoading(true);
    const currDate = new Date();
    try {
      let data : ClientDTO | undefined;
      if (id) {
        data = await apiClient.getClientById(parseInt(id));
      } else {
        data = await apiClient.getCurrentClient();
      }
      setClient(data);
      setUser(data.user);
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

  const handleReservationUpdate = (
    reservationId: number,
    updatedReservation: TrainingReservationDTO
  ) => {
    
    const updatedReservations = client!.trainingReservations!.map((tr) =>
        tr.id === reservationId ? updatedReservation : tr
      );
    const newClient = new ClientDTO(client);
    newClient.trainingReservations = updatedReservations;
    
    setClient(newClient);
  };

  const handleGenerateCredentials = async () => {
    if (window.confirm("Вы точно хотите сгенерировать новые данные для входа этого пользователя? Старые данные будут утеряны!"))
    {
      try {
        const data = await apiClient.generateNewCredentials(client!.userId);
        setCredentials({username: data.userName!, password: data.password!});
        client!.user!.userName! = data.userName!;
      } catch (error)
      {
        console.error("Ошибка при генерации данных для входа пользователя: ", error);
      }
    }
  };

  const handleCreateMembership = () => {
    setOpenMembershipDialog(true)
  };

  if (credentials) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        px: 2,
      }}
    >
      <CredentialsPrint
        username={credentials.username}
        password={credentials.password}
        onClose={() => setCredentials(null)}
      />
    </Box>
  );
}

  if (isLoading)
    return <CircularProgress/>;

  if (!user)
    return <Typography>Не удалось получить пользователя</Typography>

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
                  {user!.fullName}
                </Typography>

                <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", mt: 1 }}>
                  <Typography color="text.secondary">
                    @{user!.userName}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Actions */}
        {id && <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 3,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            onClick={handleGenerateCredentials}
          >
            Сгенерировать данные для входа
          </Button>

          <Button
            variant="outlined"
            onClick={handleCreateMembership}
          >
            Оформить абонемент
          </Button>
        </Box>}
        <CreateMembershipDialog
          open={openMembershipDialog}
          onClose={() => {setOpenMembershipDialog(false); setMembershipDialogError("");}}
          membershipTypes={membershipTypes}
          selectedClient={client}
          error={membershipDialogError}
          setError={setMembershipDialogError}
          onSuccess={fetchClient}
        />

        {/* Tabs */}
        {(userRole === "User" || id) &&
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ mb: 3 }}
        >
          <Tab value="profile" icon={<PersonIcon />} iconPosition="start" label="Профиль" />
          <Tab value="memberships" icon={<CreditCardIcon />} iconPosition="start" label="Абонементы" />
          <Tab value="classes" icon={<FitnessCenterIcon />} iconPosition="start" label="Записи" />
        </Tabs>
        }

        {/* Content */}
        {activeTab === "profile" && <ProfileInfo  currUser={user} 
                                                  setUser={setUser} 
                                                  clientBonuses={client?.bonuses} 
                                                  membership={currentMembership} 
                                                  isAdminView={id !== null && id !== undefined} />}
        {activeTab === "memberships" && <MembershipHistory memberships={client?.memberships!} />}
        {activeTab === "classes" && <ReservationHistory client={client}
                                                        fetchClient={fetchClient}
                                                        isAdminView={id !== null && id !== undefined}
                                                        reservationsList={client?.trainingReservations!}
                                                        onReservationUpdate={handleReservationUpdate} 
                                                        hideCancelled={hideCancelledClasses} 
                                                        setHideCancelled={setHideCancelledClasses}
                                                        hidePaid={hidePaidClasses}
                                                        setHidePaid={setHidePaidClasses} />}
      </Container>
    </Box>
  );
}

export default ProfilePage;