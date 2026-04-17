import { useEffect, useState } from "react";
import { ClientDTO } from "../../api/g";
import { apiClient } from "../../api/apiClient";
import { Card, CardContent, CircularProgress, Dialog, DialogContent, DialogTitle, GridLegacy, TextField, Typography } from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (client: ClientDTO) => void;
}

export function ClientSelectDialog({ open, onClose, onSelect }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<ClientDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetch = async () => {
      setIsLoading(true);
      const data = await apiClient.getFilteredClients(searchQuery);
      setClients(data || []);
      setIsLoading(false);
    };

    fetch();
  }, [searchQuery, open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Выбор клиента</DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          placeholder="Введите ФИО, логин или номер телефона клиента"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
        />

        {isLoading ? (
          <CircularProgress />
        ) : (
          <GridLegacy container spacing={2}>
            {clients.map((client) => (
              <GridLegacy item xs={12} md={6} key={client.id}>
                <Card
                  sx={{ cursor: "pointer" }}
                  onClick={() => onSelect(client)}
                >
                  <CardContent>
                    <Typography fontWeight={600}>
                      {client.user?.fullName}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      @{client.user?.userName}
                    </Typography>
                  </CardContent>
                </Card>
              </GridLegacy>
            ))}
          </GridLegacy>
        )}
      </DialogContent>
    </Dialog>
  );
}