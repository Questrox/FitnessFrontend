import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  GridLegacy,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import EditIcon from "@mui/icons-material/Edit";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { ChangePasswordModel, ClientDTO, LoginResult, MembershipDTO, UserDTO } from "../../api/g";
import { useState, useEffect } from "react";
import { apiClient } from "../../api/apiClient";
import { PhoneRounded } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";

interface Props {
  client: ClientDTO;
  setClient: (value: ClientDTO) => void;
  membership?: MembershipDTO;
  isAdminView: boolean
}

export function ProfileInfo({ client, setClient, membership, isAdminView }: Props) {
  const { user, updateUserName } = useAuth();
  const [error, setError] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [editData, setEditData] = useState({
    fullName: client.user!.fullName,
    userName: client.user!.userName,
    phoneNumber: client.user!.phoneNumber,
  });
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [editMode, setEditMode] = useState({
    fullName: false,
    userName: false,
    phoneNumber: false,
  });

  useEffect(() => {
    if (client) {
      setEditData({
        fullName: client.user!.fullName,
        userName: client.user!.userName,
        phoneNumber: client.user!.phoneNumber,
      });
    }
  }, [client]);

  // Проверка наличия изменений
  const hasChanges =
    editData.fullName !== client.user!.fullName ||
    editData.userName !== client.user!.userName ||
    editData.phoneNumber !== client.user!.phoneNumber;

  const handleSave = async () => {
    if (!client.user)
      return;
    if (!editData.fullName)
    {
      setError("ФИО не может быть пустым");
      return;
    }
    if (!editData.phoneNumber)
    {
      setError("Номер телефона не может быть пустым");
      return;
    }
    if (!editData.userName)
    {
      setError("Логин не может быть пустым");
      return;
    }
    const data = new UserDTO();
    data.fullName = editData.fullName;
    data.userName = editData.userName;
    data.phoneNumber = editData.phoneNumber;
    data.email = client.user.email;
    data.id = client.user.id;
    try {
      await apiClient.updateUser(client.user!.id!, data);
      setEditMode({
        fullName: false,
        userName: false,
        phoneNumber: false,
      });
      
      if (!isAdminView && user!.userName != editData.userName) 
      {
        updateUserName(editData.userName);
      }

      const updatedClient = new ClientDTO(client);
      updatedClient.user!.fullName = editData.fullName;
      updatedClient.user!.userName = editData.userName;
      updatedClient.user!.phoneNumber = editData.phoneNumber;
      setClient(updatedClient);
      setError("");
    } catch (error: any) {
      const message = error.message.split(": ")[1];
      setError(message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const model = new ChangePasswordModel();
      model.oldPassword = passwordData.oldPassword;
      model.newPassword = passwordData.newPassword;

      await apiClient.resetPassword(model);
      handleCloseDialog();
    } catch (error: any) {
      //const message = error.message.split(": ")[1];
      if (error.message.includes("Incorrect password"))
        setDialogError("Введен неверный старый пароль");
      else
        setDialogError("Новый пароль не соответствует требованиям");
    }
  };

  const handleCloseDialog = () => {
    setOpenPasswordDialog(false);
    setPasswordData({
      oldPassword: "",
      newPassword: "",
    });
    setDialogError("");
  }

  return (
    <GridLegacy container spacing={4}>
      {/* Личная информация */}
      <GridLegacy item xs={12} lg={6}>
        <Card>
          <CardHeader
            title={
              <Stack direction="row" alignItems="center" spacing={1}>
                <PersonIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Личная информация
                </Typography>
              </Stack>
            }
          />

          <CardContent>
            <Stack spacing={3}>
              {/* Бонусы */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Количество бонусов
                </Typography>

                <Typography fontWeight={600} sx={{ mt: 0.5 }}>
                  {client.bonuses}
                </Typography>
              </Box>
              {/* Имя */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  ФИО
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "action.hover"
                  }}
                >
                  {editMode.fullName ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editData.fullName}
                      onChange={(e) =>
                        setEditData({ ...editData, fullName: e.target.value })
                      }
                    />
                  ) : (
                    <Typography fontWeight={600}>
                      {editData.fullName}
                    </Typography>
                  )}

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    sx={{ml: 2, minWidth: 120}}
                    onClick={() =>
                      setEditMode((prev) => ({
                        ...prev,
                        fullName: !prev.fullName,
                      }))
                    }
                  >
                    {editMode.fullName ? "Готово" : "Изменить"}
                  </Button>
                </Box>
              </Box>

              {/* Username */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Логин
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "action.hover"
                  }}
                >
                  {editMode.userName ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editData.userName}
                      onChange={(e) =>
                        setEditData({ ...editData, userName: e.target.value })
                      }
                    />
                  ) : (
                    <Typography fontWeight={600}>
                      @{editData.userName}
                    </Typography>
                  )}

                  {!isAdminView && <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      sx={{ml: 2, minWidth: 120}}
                      onClick={() =>
                        setEditMode((prev) => ({
                          ...prev,
                          userName: !prev.userName,
                        }))
                      }
                    >
                      {editMode.userName ? "Готово" : "Изменить"}
                    </Button>
                  }
                </Box>
              </Box>

              {/* Телефон */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Телефон
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "action.hover"
                  }}
                >
                  {editMode.phoneNumber ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editData.phoneNumber}
                      onChange={(e) =>
                        setEditData({ ...editData, phoneNumber: e.target.value })
                      }
                    />
                  ) : (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneIcon color="action" />
                      <Typography fontWeight={600}>
                        {editData.phoneNumber}
                      </Typography>
                    </Stack>
                  )}

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    sx={{ml: 2, minWidth: 120}}
                    onClick={() =>
                      setEditMode((prev) => ({
                        ...prev,
                        phoneNumber: !prev.phoneNumber,
                      }))
                    }
                  >
                    {editMode.phoneNumber ? "Готово" : "Изменить"}
                  </Button>
                </Box>
              </Box>

              {/* Email */}
              {/* <Box>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "action.hover"
                  }}
                >
                  <EmailIcon color="action" />
                  <Typography fontWeight={600}>
                    {client.email}
                  </Typography>
                </Box>
              </Box> */}
              {error && <Typography color="error" marginTop={1}>{error}</Typography>}
              {!isAdminView && <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setOpenPasswordDialog(true)}
                >
                  Изменить пароль
                </Button>
              }
              {hasChanges && (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSave}
                >
                  Сохранить изменения
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>
        <Dialog
          open={openPasswordDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          component="form"
          onSubmit={handleChangePassword} 
          id="passwordResetForm"
        >
          <DialogTitle>Изменение пароля</DialogTitle>

          <DialogContent>
            <Stack spacing={2} mt={1}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Пароль должен соответствовать следующим требованиям:
                </Typography>

                <Typography variant="body2">
                  • Длина пароля должна быть не менее 6 символов
                </Typography>
                <Typography variant="body2">
                  • Пароль должен содержать только символы латинского алфавита
                </Typography>
                <Typography variant="body2">
                  • Пароль не должен содержать пробелов
                </Typography>
                <Typography variant="body2">
                  • Пароль должен содержать как минимум 1 заглавную букву
                </Typography>
                <Typography variant="body2">
                  • Пароль должен содержать как минимум 1 строчную букву
                </Typography>
                <Typography variant="body2">
                  • Пароль должен содержать как минимум 1 цифру
                </Typography>
                <Typography variant="body2">
                  • Пароль должен содержать как минимум 1 спецсимвол
                </Typography>
              </Box>
              <TextField
                label="Старый пароль"
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, oldPassword: e.target.value })
                }
                fullWidth
                required
              />

              <TextField
                label="Новый пароль"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                fullWidth
                required
              />
              {dialogError && <Typography color="error" marginTop={1}>{dialogError}</Typography>}
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Отмена
            </Button>

            <Button
              variant="contained"
              onSubmit={handleChangePassword} 
              type="submit" 
              form="passwordResetForm"
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </GridLegacy>

      {/* Абонемент */}
      <GridLegacy item xs={12} lg={6}>
        <Card>
          <CardHeader
            title={
              <Stack direction="row" spacing={1} alignItems="center">
                <CreditCardIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Текущий абонемент
                </Typography>
              </Stack>
            }
          />

          <CardContent>
            {membership ? (
              <Stack spacing={3}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider"
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Тариф
                  </Typography>

                  <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                    {membership.membershipType!.name}
                  </Typography>

                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    {membership.membershipType!.description}
                  </Typography>

                  <Box sx={{ pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarTodayIcon fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        Дата окончания
                      </Typography>
                    </Stack>

                    <Typography fontWeight={700} sx = {{ mt: 1 }}>
                      {new Date(membership.endDate!).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            ) : (
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: "1px dashed",
                  borderColor: "divider",
                  textAlign: "center"
                }}
              >
                <Typography color="text.secondary">
                    Нет активного абонемента
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </GridLegacy>
    </GridLegacy>
  );
}