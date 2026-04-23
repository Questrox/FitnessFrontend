import { Dialog, DialogTitle, DialogContent, Stack, TextField, Box, Button, Typography, DialogActions } from "@mui/material";
import { useState } from "react";
import { apiClient } from "../../api/apiClient";
import { CredentialsPrint } from "./CredentialsPrint";

interface CreateCoachDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  setCredentials: (value: any) => void;
}

const getImageSrc = (path: string) => {
  if (!path) return "";
  if (path.startsWith("blob:")) return path;
  if (path.startsWith("http")) return path;
  return `/${path}`;
};


export function CreateCoachDialog({ isOpen, onClose, onSuccess, setCredentials }: CreateCoachDialogProps) {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (photoFile === null)
    {
      setError("Пожалуйста, загрузите фото");
      return;
    }
    
    try {
      const fileParam = photoFile ? { data: photoFile, fileName: photoFile.name } : { data: new Blob(), fileName: "" }; 
      const result = await apiClient.addCoach(parseInt(yearsExperience), fullName, phoneNumber, fileParam);
      setCredentials({username: result.userName!, password: result.password!})
      await onSuccess();
      handleClose();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleClose = () => {
    setFullName("");
    setPhoneNumber("");
    setYearsExperience("");
    setPhotoFile(null);
    setError("");
    onClose();
  };

  return (
  <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="sm">
    <DialogTitle>Создание тренера</DialogTitle>

    <DialogContent>
      <Box
        component="form"
        onSubmit={handleSubmit}
        id="createCoachForm"
        sx={{ mt: 2 }}
      >
        <Stack spacing={3}>
          <TextField
            label="ФИО"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Телефон"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Опыт (лет)"
            type="number"
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
            InputProps={{ inputProps: { min: 0 } }}
            fullWidth
            required
          />

          {/* Фото */}
          <Box>
            <Stack direction="row" spacing={2} alignItems="center">
              {photoFile && (
                <Box
                  component="img"
                  src={getImageSrc(URL.createObjectURL(photoFile))}
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
              >
                Загрузить изображение
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </Button>
            </Stack>
          </Box>

          {/* Ошибка */}
          {error && (
            <Typography color="error">
              {error}
            </Typography>
          )}
        </Stack>
      </Box>
    </DialogContent>

    <DialogActions>
      <Button onClick={handleClose}>Отмена</Button>
      <Button
        type="submit"
        form="createCoachForm"
        variant="contained"
      >
        Создать
      </Button>
    </DialogActions>
  </Dialog>
);
}