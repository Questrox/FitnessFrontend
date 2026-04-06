import {
  Box,
  Typography,
  Divider,
  Stack,
  Button,
} from "@mui/material";

interface Props {
  username: string;
  password: string;
  onClose: () => void;
}

export const CredentialsPrint = ({ username, password, onClose }: Props) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Печатная область */}
      <Box
        id="print-area"
        sx={{
          color: "text.primary",
          "@media print": {
            color: "black",
            bgcolor: "white",
            width: "100%",
          },
        }}
      >
        <Stack spacing={3}>
          {/* Заголовок */}
          <Box textAlign="center">
            <Typography variant="h5" fontWeight={700}>
              Данные для входа
            </Typography>
            <Typography variant="body2">
              Пожалуйста, сохраните эту информацию
            </Typography>
          </Box>

          <Divider />

          {/* Логин */}
          <Box>
            <Typography variant="body2" color="text.secondary">
              Логин
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {username}
            </Typography>
          </Box>

          {/* Пароль */}
          <Box>
            <Typography variant="body2" color="text.secondary">
              Временный пароль
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {password}
            </Typography>
          </Box>

          <Divider />

          {/* Инструкция */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Важно:
            </Typography>

            <Typography variant="body2">
              • Сохраните логин и пароль
            </Typography>
            <Typography variant="body2">
              • При первом входе смените пароль
            </Typography>
            <Typography variant="body2">
              • Не передавайте данные третьим лицам
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Кнопки (НЕ печатаются) */}
      <Box
        sx={{
          mb: 3,
          mt: 3,
          display: "flex",
          gap: 2,
          "@media print": {
            display: "none",
          },
        }}
      >
        <Button variant="outlined" onClick={onClose}>
          Назад
        </Button>

        <Button variant="contained" onClick={handlePrint}>
          Печать
        </Button>
      </Box>

      {/* Инструкция для администратора (НЕ печатается) */}
      <Box
        sx={{
          mt: 2,
          p: 2,
          borderRadius: 2,
          border: "1px solid",
          "@media print": {
            display: "none",
          },
        }}
      >
        <Stack spacing={1}>
          <Typography variant="subtitle2" fontWeight={600}>
            📋 Инструкция:
          </Typography>
          <Typography variant="body2">
            1. Нажмите кнопку «Печать» выше
          </Typography>
          <Typography variant="body2">
            2. В диалоговом окне печати во вкладке "Дополнительные настройки" снимите галочку с «Колонтитулы» (чтобы убрать URL и дату)
          </Typography>
          <Typography variant="body2">
            3. Распечатайте страницу и передайте распечатку пользователю
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};