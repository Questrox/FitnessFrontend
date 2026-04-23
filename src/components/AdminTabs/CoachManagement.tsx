import { Box, Stack, Typography, Button, GridLegacy, Card, CardContent, Divider, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PhoneIcon from "@mui/icons-material/Phone";
import { useEffect, useState } from "react";
import { CoachDTO } from "../../api/g";
import { CreateCoachDialog } from "./CreateCoachDialog";
import { EditCoachDialog } from "./EditCoachDialog";
import { apiClient } from "../../api/apiClient";
import { CredentialsPrint } from "./CredentialsPrint";

export function CoachManagement() {
  const [coaches, setCoaches] = useState<CoachDTO[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<CoachDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [credentials, setCredentials] = useState<{
        username: string;
        password: string;
      } | null>(null);

  useEffect(() => {
    fetchCoaches();
  }, [])
  
  const fetchCoaches = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getCoaches();
      setCoaches(data || []);
    } catch (error) {
      console.error("Ошибка при загрузке тренеров:", error);
    }
    setIsLoading(false);
  }

  const handleEditCoach = (coach: CoachDTO) => {
    setSelectedCoach(coach);
    setEditDialogOpen(true);
  };

  const handleDeleteCoach = async (coachId: number, coachName: string) => {
    if (window.confirm(`Вы уверены, что хотите удалить тренера "${coachName}"?`)) {
      try {
        await apiClient.softDeleteCoach(coachId);
        const updatedCoaches = coaches.filter(coach => coach.id !== coachId);
        setCoaches(updatedCoaches);
      } catch (error) {
        console.error("Ошибка при удалении тренера: ", error);
      }
    }
  };

  if (credentials) {
    return (
      <CredentialsPrint
        username={credentials.username}
        password={credentials.password}
        onClose={() => {setCredentials(null)}}
      />
    );
  }

  if (isLoading)
    return <CircularProgress />

  return (
    <Box>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >


        <Button
          variant="contained"
          onClick={() => setCreateDialogOpen(true)}
          startIcon={<AddIcon />}
        >
          Добавить тренера
        </Button>
      </Stack>

      {/* Grid */}
      <GridLegacy container spacing={3}>
        {coaches.map((coach) => (
          <GridLegacy item xs={12} md={6} lg={4} key={coach.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "0.2s",
                "&:hover": { boxShadow: 6 },
              }}
            >
              {/* Фото */}
              <Box
                sx={{
                  maxHeight: 300,
                  position: "relative",
                  bgcolor: "grey.100",
                }}
              >
                <Box
                  component="img"
                  src={`/${coach.photoPath}`}
                  alt={coach.user?.fullName}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "background.paper",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    boxShadow: 2,
                  }}
                >
                  <Typography variant="caption" fontWeight={600}>
                    {coach.experience}{" "}
                    {coach.experience === 1 ? "год" : "лет"}
                  </Typography>
                </Box>
              </Box>

              {/* Контент */}
              <CardContent
                sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                }}
                >
                {/* ВЕРХ */}
                <Box>
                    <Typography variant="h6" fontWeight={700}>
                    {coach.user?.fullName}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" mb={2}>
                    @{coach.user?.userName}
                    </Typography>
                </Box>

                {/* НИЗ (телефон прижат к Divider) */}
                <Box
                    sx={{
                    mt: "auto",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    }}
                >
                    <PhoneIcon fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                    {coach.user?.phoneNumber}
                    </Typography>
                </Box>

                {/* КНОПКИ */}
                <Box>
                    <Divider sx={{ mb: 2 }} />

                    <Stack direction="row" spacing={1.5}>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => handleEditCoach(coach)}
                        sx={{ flex: 2 }}
                    >
                        Изменить
                    </Button>

                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() =>
                        handleDeleteCoach(coach.id!, coach.user?.fullName!)
                        }
                        sx={{ flex: 1.2 }}
                    >
                        Удалить
                    </Button>
                    </Stack>
                </Box>
                </CardContent>
            </Card>
          </GridLegacy>
        ))}
      </GridLegacy>

      {/* Empty */}
      {coaches.length === 0 && (
        <Card sx={{ mt: 3, borderWidth: 2 }}>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h6" mb={1}>
              Нет тренеров
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Добавьте первого тренера, чтобы начать работу
            </Typography>
          </CardContent>
        </Card>
      )}

      <CreateCoachDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={fetchCoaches}
        setCredentials={setCredentials}
      />

      <EditCoachDialog
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        coach={selectedCoach}
      />
    </Box>
  );
}