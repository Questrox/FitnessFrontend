import { Dialog, DialogTitle, DialogContent, Stack, TextField, Box, Button, Typography, DialogActions, Alert } from "@mui/material";
import { useState } from "react";
import { apiClient } from "../../api/apiClient";
import { CredentialsPrint } from "./CredentialsPrint";
import { useSnackbar } from "../../context/SnackbarContext";

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
  const {showSnackbar} = useSnackbar();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;
    
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      showSnackbar("Некорректный формат файла, допустимы только PNG, JPG и WebP", "error");
      return;
    }

    setPhotoFile(file);
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
            onChange={(e) => {
              if (e.target.value === "")
              {
                setYearsExperience("");
                return;
              }
              const raw = e.target.value;
              const value = Math.min(Math.max(0, Number(raw)), 100);
              setYearsExperience(value.toString());
            }}
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
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoChange}
                />
              </Button>
            </Stack>
          </Box>

          {/* Ошибка */}
          {error && (
            <Alert
              severity="error"
              sx={{ mt: 2 }}
            >
              {error}
            </Alert>
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