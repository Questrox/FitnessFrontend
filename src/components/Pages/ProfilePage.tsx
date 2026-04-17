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
  CircularProgress,
  Button
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import { ClientDTO, MembershipDTO, MembershipTypeDTO, TrainingReservationDTO } from "../../api/g";
import { apiClient } from "../../api/apiClient";
import { useParams, useSearchParams } from "react-router-dom";
import { ProfileInfo } from "../ProfileTabs/ProfileInfo";
import { MembershipHistory } from "../ProfileTabs/MembershipHistory";
import { ReservationHistory } from "../ProfileTabs/ReservationHistory";
import { CreateMembershipDialog } from "../ProfileTabs/CreateMembershipDialog";
import { CredentialsPrint } from "../AdminTabs/CredentialsPrint";

const ProfilePage = () => {
  const { id } = useParams();

  // управление вкладками
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [client, setClient] = useState<ClientDTO | undefined>();
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
    await fetchClient();

    if (id)
    {
      try {
        const types = await apiClient.getMembershipTypes();
        setMembershipTypes(types || []);
      } catch (error) {
        console.error("Ошибка при загрузке типов абонементов", error);
      }
    }
  }

  const fetchClient = async () => {
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

  const handleCancelReservation = (
    reservationId: number,
    updatedReservation: TrainingReservationDTO
  ) => {
    
    const updatedReservations = client!.trainingReservations!.map((tr) =>
        tr.id === reservationId ? updatedReservation : tr
      );
    const newClient = new ClientDTO();
    newClient.bonuses = client?.bonuses;
    newClient.cancellationNotifications = client?.cancellationNotifications;
    newClient.id = client?.id;
    newClient.memberships = client?.memberships;
    newClient.user = client?.user;
    newClient.userId = client?.userId;
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
        <CredentialsPrint
          username={credentials.username}
          password={credentials.password}
          onClose={() => setCredentials(null)}
        />
      );
    }

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
        {activeTab === "profile" && <ProfileInfo client={client} membership={currentMembership} isAdminView={id != null && id != undefined} />}
        {activeTab === "memberships" && <MembershipHistory memberships={client.memberships!} />}
        {activeTab === "classes" && <ReservationHistory reservationsList={client.trainingReservations!}
                                                        onCancel={handleCancelReservation} 
                                                        hideCancelled={hideCancelledClasses} 
                                                        setHideCancelled={setHideCancelledClasses}
                                                        hidePaid={hidePaidClasses}
                                                        setHidePaid={setHidePaidClasses} />}
      </Container>
    </Box>
  );
}

export default ProfilePage;