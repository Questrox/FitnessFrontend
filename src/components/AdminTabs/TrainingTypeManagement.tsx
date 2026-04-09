import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  GridLegacy,
  IconButton,
  Chip,
  CircularProgress,
  DialogTitle,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/Upload";
import { TrainingTypeDTO } from "../../api/g";
import { apiClient } from "../../api/apiClient";


export function TrainingTypeManagement() {
  const [open, setOpen] = useState(false);
  const [editingTrainingType, setEditingTrainingType] = useState<TrainingTypeDTO | null>(null);
  const [trainingTypes, setTrainingTypes] = useState<TrainingTypeDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [image, setImage] = useState<File | undefined>(undefined);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxClients: "",
    duration: "60",
    price: "",
    cashbackPercentage: "",
    photoPath: "",
  });

  useEffect(() => {
    fetchTypes();
  }, [])
  
  const fetchTypes = async () => {
    try {
      const data = await apiClient.getTrainingTypes()
      setTrainingTypes(data || [])
    } catch (error) {
      console.error("Ошибка при загрузке типов абонементов:", error)
    }
    setIsLoading(false);
  }

  const getImageSrc = (path: string) => {
  if (!path) return "";

  // если это blob (локальный preview)
  if (path.startsWith("blob:")) {
    return path;
  }

  // если это абсолютный URL (http)
  if (path.startsWith("http")) {
    return path;
  }
  // иначе — это путь с сервера
  return `/${path}`;
};

  const handleEdit = (trainingType: TrainingTypeDTO) => {
    setEditingTrainingType(trainingType);
    setFormData({
      name: trainingType.name!,
      description: trainingType.description!,
      maxClients: trainingType.maxClients!.toString(),
      duration: trainingType.duration!.toString(),
      price: trainingType.price!.toString(),
      cashbackPercentage: trainingType.cashbackPercentage!.toString(),
      photoPath: trainingType.photoPath!,
    });
    setOpen(true);
  };

  const handleCreate = () => {
    setEditingTrainingType(null);
    setFormData({
      name: "",
      description: "",
      maxClients: "",
      duration: "",
      price: "",
      cashbackPercentage: "",
      photoPath: "",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTrainingType(null);
    setImage(undefined);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.photoPath) {
      alert("Пожалуйста, загрузите изображение");
      return;
    }
    const data = {
      id: editingTrainingType?.id,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      cashbackPercentage: parseInt(formData.cashbackPercentage),
      duration: parseInt(formData.duration),
      maxClients: parseInt(formData.maxClients),
      photoPath: formData.photoPath
    }
    if (data.price < 0)
    {
      setError("Цена должна быть неотрицательной");
      return;
    }
    if(data.cashbackPercentage < 0 || data.cashbackPercentage > 100)
    {
      setError("Процент кэшбека должен быть в пределах от 0 до 100");
      return;
    }
    if (data.duration <= 0)
    {
      setError("Продолжительность должна быть положительной");
      return;
    }
    if (data.maxClients <= 0)
    {
      setError("Количество клиентов должно быть положительным");
      return;
    }
    if (editingTrainingType)
    {
      const fileParam = image ? { data: image, fileName: image.name } : { data: new Blob(), fileName: "" }; 
      try {
        const updated = await apiClient.updateTrainingType(data.id!, data.id, data.maxClients, data.price, data.name, data.description, 
          data.photoPath, data.duration, data.cashbackPercentage, fileParam);
        fetchTypes();
        handleClose();
      } catch (error: any) {
        setError(error.message);
      }
    }
    else
    {
      console.log("Создаем")
      const fileParam = image ? { data: image, fileName: image.name } : { data: new Blob(), fileName: "" }; 
      try {
        const created = await apiClient.addTrainingType(data.price, data.maxClients, data.name, data.description, data.cashbackPercentage, data.duration, fileParam);
        fetchTypes();
        handleClose();
      } catch (error: any) {
        setError(error.message);
      }
    }
  };

  const handleDelete = async (trainingType: TrainingTypeDTO) => {
    if (window.confirm(`Вы действительно хотите удалить "${trainingType.name}"?`)) {
      setIsLoading(true);
      await apiClient.softDeleteTrainingType(trainingType.id!);
      await fetchTypes();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file)
    {
      setImage(file);
      const previewUrl = URL.createObjectURL(file);

      setFormData((prev) => ({
        ...prev,
        photoPath: previewUrl,
      }));
    }
  };

  if (isLoading)
    return <CircularProgress/>

  return (
    <Box>
      {/* Action */}
      <Box sx={{ mb: 3 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Создать тип тренировки
        </Button>
      </Box>

      {/* Form */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
         <DialogTitle>
          {editingTrainingType ? "Редактировать тип тренировки" : "Создать тип тренировки"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }} id="trainingTypeForm">
            <GridLegacy container spacing={3}>
              <GridLegacy item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Название"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </GridLegacy>

              <GridLegacy item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Макс. клиентов"
                  type="number"
                  value={formData.maxClients}
                  onChange={(e) =>
                    setFormData({ ...formData, maxClients: e.target.value })
                  }
                  required
                />
              </GridLegacy>

              <GridLegacy item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Длительность (мин)"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: e.target.value,
                    })
                  }
                  required
                />
              </GridLegacy>

              <GridLegacy item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Цена"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </GridLegacy>

              <GridLegacy item xs={12}>
                <TextField
                  fullWidth
                  label="Кэшбэк (%)"
                  type="number"
                  value={formData.cashbackPercentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cashbackPercentage: e.target.value,
                    })
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
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  required
                />
                {error && <Typography color="error" marginTop={1}>{error}</Typography>}
              </GridLegacy>
              

              <GridLegacy item xs={12}>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  {formData.photoPath && (
                    <Box
                      component="img"
                      src={getImageSrc(formData.photoPath)}
                      sx={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        borderRadius: 2,
                      }}
                    />
                  )}

                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                  >
                    Загрузить изображение
                    <input
                      hidden
                      type="file"
                      onChange={handleImageUpload}
                    />
                  </Button>
                </Box>
              </GridLegacy>
            </GridLegacy>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button type="submit" variant="contained" onSubmit={handleSubmit} form="trainingTypeForm">
            {editingTrainingType ? "Сохранить" : "Создать"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* List */}
      <GridLegacy container spacing={3}>
        {trainingTypes.map((trainingType) => (
          <GridLegacy item xs={12} md={6} key={trainingType.id}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <Box
                    component="img"
                    src={getImageSrc(trainingType.photoPath!)}
                    sx={{
                      width: 96,
                      height: 96,
                      borderRadius: 2,
                      objectFit: "cover",
                    }}
                  />

                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="h6" fontWeight={700}>
                        {trainingType.name}
                      </Typography>

                      <Box sx={{minWidth: 100}}>
                        <IconButton onClick={() => handleEdit(trainingType)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(trainingType)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                      <Chip label={`${trainingType.price} ₽`} color="success" />
                      <Chip label={`До ${trainingType.maxClients} чел.`} />
                      <Chip label={`${trainingType.cashbackPercentage}%`} color="secondary"/>
                    </Box>
                  </Box>
                </Box>

                <Typography
                  sx={{
                    mb: 2,
                    display: "-webkit-box",
                    overflow: "hidden",
                  }}
                >
                  {trainingType.description}
                </Typography>

                <Box sx={{ mt: "auto", pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
                  <GridLegacy container>
                    <GridLegacy item xs={4}>
                      <Typography variant="caption">Цена</Typography>
                      <Typography fontWeight={700}>
                        {trainingType.price} ₽
                      </Typography>
                    </GridLegacy>
                    <GridLegacy item xs={4}>
                      <Typography variant="caption">Места</Typography>
                      <Typography fontWeight={700}>
                        {trainingType.maxClients}
                      </Typography>
                    </GridLegacy>
                    <GridLegacy item xs={4}>
                      <Typography variant="caption">Кэшбэк</Typography>
                      <Typography fontWeight={700}>
                        {trainingType.cashbackPercentage}%
                      </Typography>
                    </GridLegacy>
                  </GridLegacy>
                </Box>

              </CardContent>
            </Card>
          </GridLegacy>
        ))}
      </GridLegacy>
    </Box>
  );
}