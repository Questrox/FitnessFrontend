import { useEffect, useState } from "react";
import { ClientDTO, ClientDTOPagedResult } from "../../api/g";
import { apiClient } from "../../api/apiClient";
import { Box, Card, CardContent, CircularProgress, Dialog, DialogContent, DialogTitle, GridLegacy, TextField, Typography, Pagination } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { Phone } from "@mui/icons-material";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (client: ClientDTO) => void;
}

export function ClientSelectDialog({ open, onClose, onSelect }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<ClientDTOPagedResult | undefined>(undefined);
  const [page, setPage] = useState<number>(1);
  const pageSize = 6;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    fetch(searchQuery, page);
  }, [open]);

  const fetch = async (query: string, pageNumber: number) => {
    setIsLoading(true);
    const data = await apiClient.getPagedFilteredClients(pageNumber, pageSize, query);
    setClients(data);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onClose={() => { onClose(); setSearchQuery(""); setPage(1); }} fullWidth maxWidth="md">
      <DialogTitle>Выбор клиента</DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          placeholder="Введите ФИО, логин или номер телефона клиента"
          value={searchQuery}
          onChange={(e) => {setSearchQuery(e.target.value); setPage(1); fetch(e.target.value, 1)}}
          sx={{ mb: 2 }}
        />

        {isLoading ? (
        <CircularProgress />
        ) : (
        <GridLegacy container spacing={2}>
            {clients?.totalCount === 0 ? (
            <Card sx={{ mt: 3, ml: 2, flexGrow: 1 }}>
                <CardContent sx={{ textAlign: "center", py: 6 }}>
                <PersonIcon sx={{ fontSize: 60, color: "text.disabled" }} />
                <Typography color="text.secondary">
                    Клиенты не найдены
                </Typography>
                </CardContent>
            </Card>
            ) : (
            clients?.items?.map((client) => (
                <GridLegacy item xs={12} md={6} key={client.id}>
                <Card sx={{ cursor: "pointer" }} onClick={() => onSelect(client)}>
                    <CardContent>
                    <Typography fontWeight={600}>
                        {client.user?.fullName}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        @{client.user?.userName}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
                        <Phone fontSize="small" />
                        <Typography variant="body2">
                        {client.user?.phoneNumber}
                        </Typography>
                    </Box>
                    </CardContent>
                </Card>
                </GridLegacy>
            ))
            )}
        </GridLegacy>
        )}
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={clients !== undefined && clients ? Math.ceil(clients.totalCount! / pageSize) : 1}
            page={page}
            onChange={(e, value) => { setPage(value); fetch(searchQuery, value); }}
            color="primary"
            />
        </Box>
      </DialogContent>
    </Dialog>
  );
}