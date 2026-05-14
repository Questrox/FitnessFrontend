import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  GridLegacy,
  CircularProgress,
  Pagination,
  Alert
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PhoneIcon from "@mui/icons-material/Phone";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PersonIcon from "@mui/icons-material/Person";
import { ClientDTO, ClientDTOPagedResult, CreateClientDTO, MembershipDTO } from "../../api/g";
import { apiClient } from "../../api/apiClient";
import { useNavigate } from "react-router-dom";
import { CredentialsPrint } from "./CredentialsPrint";

export function ClientManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [credentials, setCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);

  const [newClientData, setNewClientData] = useState({
    name: "",
    phoneNumber: "",
  });

  const [filteredClients, setFilteredClients] = useState<ClientDTOPagedResult | undefined>(undefined);
  const [error, setError] = useState<string>("");

  const [page, setPage] = useState<number>(1);
  const pageSize = 6;

  useEffect(() => {
    const delay = setTimeout(() => { fetchClients(searchQuery, page); }, 200);
    return () => clearTimeout(delay);
  }, [searchQuery])
    
  const fetchClients = async (query: string, pageNumber: number) => {
    setIsLoading(true);
    try {
      const data = await apiClient.getPagedFilteredClients(pageNumber, pageSize, query);
      setFilteredClients(data);
    } catch (error) {
      console.error("Ошибка при загрузке клиентов:", error);
    }
    setIsLoading(false);
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();

    try
    {
      const dto = new CreateClientDTO();
      dto.fullName = newClientData.name;
      dto.phoneNumber = newClientData.phoneNumber;
      const data = await apiClient.addClient(dto);
      setCredentials({username: data.userName!, password: data.password!});
      handleCloseDialog();
      setPage(1);
      await fetchClients(searchQuery, 1);
    } catch (err: any)
    {
      setError(err.message);
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setNewClientData({name: "", phoneNumber: "",})
    setError("");
  }

  if (credentials) {
    return (
      <CredentialsPrint
        username={credentials.username}
        password={credentials.password}
        onClose={() => setCredentials(null)}
      />
    );
  }

  return (
    <Box>
      {/* Top controls */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <TextField
          fullWidth
          placeholder="Введите ФИО, логин или номер телефона"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          sx={{ whiteSpace: "nowrap", paddingLeft: 5, paddingRight: 5 }}
        >
          Добавить клиента
        </Button>
      </Box>

      {/* List */}
      {isLoading ? 
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 150 }}>
          <CircularProgress size={60} />
        </Box> : 
        <GridLegacy container spacing={3}>
          {filteredClients?.items?.map((client) => {

            return (
              <GridLegacy item xs={12} md={6} lg={4} key={client.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "0.2s",
                    "&:hover": { boxShadow: 6 },
                  }}
                >
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {client.user?.fullName}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          @{client.user?.userName}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Spacer */}
                    <Box sx={{ flexGrow: 1 }} />

                    {/* Bottom content */}
                    <Box>
                      <Box
                        sx={{
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <PhoneIcon fontSize="small" />

                        <Typography variant="body2">
                          {client.user?.phoneNumber}
                        </Typography>
                      </Box>

                      <Button
                        fullWidth
                        variant="contained"
                        endIcon={<ChevronRightIcon />}
                        onClick={() => navigate("/profiles/" + client.id)}
                      >
                        Перейти в профиль
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </GridLegacy>
            );
          })}
        </GridLegacy>
      }

      {/* Empty */}
      {!isLoading && filteredClients?.totalCount === 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <PersonIcon sx={{ fontSize: 60, color: "text.disabled" }} />
            <Typography color="text.secondary">
              Клиенты не найдены
            </Typography>
          </CardContent>
        </Card>
      )}

      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          count={filteredClients !== undefined && filteredClients ? Math.ceil(filteredClients.totalCount! / pageSize) : 1}
          page={page}
          onChange={(e, value) => { setPage(value); fetchClients(searchQuery, value); }}
          color="primary"
          />
      </Box>

      {/* Create Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Создание клиента</DialogTitle>

        <DialogContent>
          <Box
            component="form"
            id="createClientForm"
            onSubmit={handleCreateClient}
            sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}
          >
            <TextField
              label="ФИО"
              required
              value={newClientData.name}
              onChange={(e) =>
                setNewClientData({ ...newClientData, name: e.target.value })
              }
            />

            <TextField
              label="Номер телефона"
              required
              value={newClientData.phoneNumber}
              onChange={(e) =>
                setNewClientData({
                  ...newClientData,
                  phoneNumber: e.target.value,
                })
              }
            />
          </Box>
          {error && (
            <Alert
              severity="error"
              sx={{ mt: 2 }}
            >
              {error}
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button type="submit" form="createClientForm" variant="contained">
            Создать клиента
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}