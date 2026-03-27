import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  GridLegacy,
  CircularProgress
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { CreateMembershipTypeDTO, MembershipTypeDTO } from "../../api/g";
import { apiClient } from "../../api/apiClient";

export function MembershipManagement() {
  const [open, setOpen] = useState(false);
  const [editingMembership, setEditingMembership] = useState<MembershipTypeDTO | null>(null);
  const [membershipTypes, setMembershipTypes] = useState<MembershipTypeDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchTypes();
  }, [])

  const fetchTypes = async () => {
    try {
      const data = await apiClient.getMembershipTypes()
      setMembershipTypes(data || [])
    } catch (error) {
      console.error("Ошибка при загрузке типов абонементов:", error)
    }
    setIsLoading(false);
  }

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    cashbackPercentage: "",
    duration: "",
  });

  const handleEdit = (membership: MembershipTypeDTO) => {
    setEditingMembership(membership);
    setFormData({
      name: membership.name!,
      description: membership.description!,
      price: membership.price!.toString(),
      cashbackPercentage: membership.cashbackPercentage!.toString(),
      duration: membership.duration!.toString(),
    });
    setOpen(true);
  };

  const handleCreate = () => {
    setEditingMembership(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      cashbackPercentage: "",
      duration: "",
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    //alert(`${action}: ${JSON.stringify(formData, null, 2)}`);
    if (editingMembership)
    {
        const updatedType = new MembershipTypeDTO();
        updatedType.id = editingMembership.id;
        updatedType.name = formData.name;
        updatedType.description = formData.description;
        updatedType.price = parseFloat(formData.price);
        updatedType.cashbackPercentage = parseInt(formData.cashbackPercentage);
        updatedType.duration = parseInt(formData.duration);
        try {
            const updated = await apiClient.updateMembershipType(editingMembership.id!, updatedType);
            //setMembershipTypes((prev) => prev.map((rt) => (rt.id === updated.id ? updated : rt)))
            fetchTypes();
            handleClose();
        } catch (error) {
            alert(error)
        }
    }
    else
    {
        const newType = new CreateMembershipTypeDTO();
        newType.name = formData.name;
        newType.description = formData.description;
        newType.price = parseFloat(formData.price);
        newType.cashbackPercentage = parseInt(formData.cashbackPercentage);
        newType.duration = parseInt(formData.duration);
        try {
            const created = await apiClient.addMembershipType(newType);
            //setMembershipTypes(prev => [...prev, created])
            fetchTypes();
            handleClose();
        } catch (error) {
            alert(error)
        }
    }
  };

  const handleDelete = async (membership: MembershipTypeDTO) => {
    if (window.confirm(`Вы действительно хотите удалить "${membership.name}"?`)) {
      setIsLoading(true);
      await apiClient.softDeleteMembershipType(membership.id!);
      await fetchTypes();
    }
  };

  if (isLoading)
    return <CircularProgress/>

  return (
    <Box>
      {/* Create button */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleCreate}
        sx={{ mb: 3 }}
      >
        Создать абонемент
      </Button>

      {/* Dialog (вместо Card формы) */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingMembership ? "Редактировать тип абонемента" : "Создать тип абонемента"}
        </DialogTitle>

        <DialogContent>
          <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmit} id="membershipTypeForm">
            <GridLegacy container spacing={2}>
              <GridLegacy item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Название"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </GridLegacy>

              <GridLegacy item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Длительность (мес.)"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  required
                />
              </GridLegacy>

              <GridLegacy item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Цена"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </GridLegacy>

              <GridLegacy item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Кэшбэк (%)"
                  value={formData.cashbackPercentage}
                  onChange={(e) =>
                    setFormData({ ...formData, cashbackPercentage: e.target.value })
                  }
                  required
                />
              </GridLegacy>

              <GridLegacy item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Описание"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </GridLegacy>
            </GridLegacy>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button variant="contained" onSubmit={handleSubmit} type="submit" form="membershipTypeForm">
            {editingMembership ? "Сохранить" : "Создать"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* List */}
      <GridLegacy container spacing={3}>
        {membershipTypes.map((membershipType) => (
          <GridLegacy item xs={12} md={6} key={membershipType.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {membershipType.name}
                    </Typography>

                    <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                      <Chip label={`${membershipType.price} ₽`} color="success" />
                      <Chip label={`${membershipType.duration} мес.`} />
                      <Chip label={`${membershipType.cashbackPercentage}%`} color="secondary" />
                    </Box>
                  </Box>

                  <Box sx={{minWidth: 100}}>
                    <IconButton onClick={() => handleEdit(membershipType)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(membershipType)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography mt={2} color="text.secondary">
                  {membershipType.description}
                </Typography>

                <GridLegacy container mt={2}>
                  <GridLegacy item xs={4}>
                    <Typography variant="caption">Цена</Typography>
                    <Typography fontWeight={700}>{membershipType.price} ₽</Typography>
                  </GridLegacy>
                  <GridLegacy item xs={4}>
                    <Typography variant="caption">Срок</Typography>
                    <Typography fontWeight={700}>
                      {membershipType.duration} мес.
                    </Typography>
                  </GridLegacy>
                  <GridLegacy item xs={4}>
                    <Typography variant="caption">Кэшбэк</Typography>
                    <Typography fontWeight={700}>
                      {membershipType.cashbackPercentage}%
                    </Typography>
                  </GridLegacy>
                </GridLegacy>
              </CardContent>
            </Card>
          </GridLegacy>
        ))}
      </GridLegacy>
    </Box>
  );
}