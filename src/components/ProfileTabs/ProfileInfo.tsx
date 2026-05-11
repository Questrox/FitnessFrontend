import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Divider,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EditIcon from "@mui/icons-material/Edit";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { ChangePasswordModel,  MembershipDTO, UserDTO } from "../../api/g";
import { useState, useEffect } from "react";
import { apiClient } from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ErrorIcon from "@mui/icons-material/Error";
import {
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

interface Props {
  currUser: UserDTO | undefined;
  clientBonuses: number | undefined;
  setUser: (value: UserDTO) => void;
  membership?: MembershipDTO;
  isAdminView: boolean
}

export function ProfileInfo({ currUser, clientBonuses, setUser, membership, isAdminView }: Props) {
  const { user, userRole, updateUserName } = useAuth();
  const [error, setError] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [editData, setEditData] = useState({
    fullName: currUser!.fullName,
    userName: currUser!.userName,
    phoneNumber: currUser!.phoneNumber,
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

  const viewClientInfo = userRole === "User" || userRole === "Admin" && isAdminView;

  useEffect(() => {
    if (currUser) {
      setEditData({
        fullName: currUser!.fullName,
        userName: currUser!.userName,
        phoneNumber: currUser!.phoneNumber,
      });
    }
  }, [currUser]);

  // Проверка наличия изменений
  const hasChanges =
    editData.fullName !== currUser!.fullName ||
    editData.userName !== currUser!.userName ||
    editData.phoneNumber !== currUser!.phoneNumber;

  const handleSave = async () => {
    if (!currUser)
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
    data.email = currUser.email;
    data.id = currUser.id;
    try {
      await apiClient.updateUser(currUser!.id!, data);
      setEditMode({
        fullName: false,
        userName: false,
        phoneNumber: false,
      });
      
      if (!isAdminView && user!.userName !== editData.userName) 
      {
        updateUserName(editData.userName);
      }

      const updatedUser = new UserDTO(currUser);
      updatedUser!.fullName = editData.fullName;
      updatedUser!.userName = editData.userName;
      updatedUser!.phoneNumber = editData.phoneNumber;
      setUser(updatedUser);
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
    <Stack
      direction={{ xs: "column", lg: "row" }}
      spacing={4}
      justifyContent="center"
      alignItems="stretch"
    >
      {/* Личная информация */}
      <Box
        sx={{
          flex: viewClientInfo ? "1 1 50%" : "1 1 100%",
          maxWidth: viewClientInfo ? 600 : "100%",
          width: "100%",
        }}
      >
        <Card sx={{ height: "100%" }}>
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
              {viewClientInfo &&
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Количество бонусов
                </Typography>

                <Typography fontWeight={600} sx={{ mt: 0.5 }}>
                  {clientBonuses}
                </Typography>
              </Box>
}
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
              {error && (
                <Alert
                  severity="error"
                  sx={{ mt: 2 }}
                >
                  {error}
                </Alert>
              )}
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
          <Divider/>

          <DialogContent>
            <Stack spacing={3}>
              {/* Требования с индикаторами */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Требования к новому паролю:
                </Typography>

                <List dense sx={{ bgcolor: "background.paper", borderRadius: 1 }}>
                  {[
                    { label: "Длина должна быть не менее 6 символов", check: passwordData.newPassword.length >= 6 },
                    { label: "Допускаются только символы латинского алфавита", check: /^[A-Za-z0-9@$!%*?&]*$/.test(passwordData.newPassword) },
                    { label: "Пробелы не допускаются", check: !passwordData.newPassword.includes(" ") },
                    { label: "Должна иметься как минимум 1 заглавная буква", check: /[A-Z]/.test(passwordData.newPassword) },
                    { label: "Должна иметься как минимум 1 строчная буква", check: /[a-z]/.test(passwordData.newPassword) },
                    { label: "Должна иметься как минимум 1 цифра", check: /\d/.test(passwordData.newPassword) },
                    { label: "Должен иметься как минимум 1 спецсимвол", check: /[@$!%*?&]/.test(passwordData.newPassword) },
                  ].map((req, idx) => (
                    <ListItem key={idx} disablePadding sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {req.check ? (
                          <CheckCircleIcon color="success" fontSize="small" />
                        ) : (
                          <RadioButtonUncheckedIcon color="disabled" fontSize="small" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={req.label}
                        primaryTypographyProps={{
                          variant: "body2",
                          color: req.check ? "text.primary" : "text.disabled",
                          sx: req.check ? { fontWeight: 500 } : {},
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Поля ввода */}
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

              {dialogError && (
                <Alert severity="error" icon={<ErrorIcon />}>
                  {dialogError}
                </Alert>
              )}
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
      </Box>

      {/* Абонемент */}
      {viewClientInfo && (
        <Box
          sx={{
            flex: "1 1 50%",
            maxWidth: 600,
            width: "100%",
          }}
        >
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
        </Box>
      )}
    </Stack>
  );
}