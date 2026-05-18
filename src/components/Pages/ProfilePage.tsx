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
  Button,
  Stack
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
import { useConfirm } from "material-ui-confirm";

const ProfilePage = () => {
  const { id } = useParams();
  const { userRole } = useAuth();
  const confirm = useConfirm();

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
      setSearchParams(
      { tab: activeTab },
      { replace: true }
    );
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
    const {confirmed} = await confirm({description: "Вы точно хотите сгенерировать новые данные для входа этого пользователя? Старые данные будут утеряны!"})
    if (confirmed)
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
        minHeight: "75vh",
        display: "flex",
        justifyContent: "center",
        px: 2,
        mb: 2
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

  return (
  <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 6 }}>
    <Container maxWidth="lg">
      <Card
        variant="outlined"
        sx={(theme) => ({
          minHeight: 500,
          borderRadius: 3,
          borderWidth: 2,
          transition: theme.transitions.create("border-color", {
            duration: theme.transitions.duration.shortest,
          })
        })}
      >
        <Box
          sx={(theme) => ({
            py: 4,
            textAlign: "center",
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: "20%",
              right: "20%",
              height: 3,
              bgcolor: theme.palette.primary.main,
              borderRadius: 3,
            },
          })}
        >
          <Typography variant="h4" fontWeight={700}>
            Личный кабинет
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Просмотр и управление аккаунтом
          </Typography>
        </Box>
        {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 500 }}>
          <CircularProgress size={60} />
        </Box>) : (
        <Box sx={{ p: 4 }}>
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
        </Box>
      )}
      </Card>
    </Container>
  </Box>
);
}

export default ProfilePage;