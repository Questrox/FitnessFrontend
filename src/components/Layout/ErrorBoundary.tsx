import { Box, Paper, Typography, Button, useTheme, Collapse, IconButton, Divider } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import React from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

// Компонент для отображения ошибки
const ErrorDisplay = ({ 
  error, 
  errorInfo,
  onReload,
  showDetails,
  onToggleDetails
}: { 
  error?: Error; 
  errorInfo?: React.ErrorInfo;
  onReload: () => void;
  showDetails: boolean;
  onToggleDetails: () => void;
}) => {
  const theme = useTheme();

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ bgcolor: theme.palette.background.default, p: 2 }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 5 },
          textAlign: "center",
          maxWidth: 700,
          width: "100%",
          mx: 2,
          borderRadius: 2,
        }}
      >
        <ErrorOutlineIcon
          color="error"
          sx={{ fontSize: 60, mb: 2, color: theme.palette.error.main }}
        />
        <Typography variant="h5" gutterBottom fontWeight={700}>
          Что-то пошло не так
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Произошла непредвиденная ошибка. Пожалуйста, попробуйте обновить страницу.
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          onClick={onReload}
          sx={{ textTransform: "none", fontWeight: 600, mb: 2 }}
        >
          Обновить страницу
        </Button>

        {/* Показываем сообщение об ошибке */}
        {error?.message && (
          <Typography
            sx={{
              p: 1.5,
              bgcolor: theme.palette.error.light + "20",
              borderRadius: 1,
              color: theme.palette.error.main,
              wordBreak: "break-word",
            }}
          >
            <strong>Ошибка:</strong> {error.message}
          </Typography>
        )}

        {/* Кнопка для раскрытия деталей */}
        <Button
          onClick={onToggleDetails}
          size="medium"
          endIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ textTransform: "none" }}
        >
          {showDetails ? "Скрыть" : "Показать"} стеки компонентов и вызовов
        </Button>

        {/* Раскрываемый блок с деталями */}
        <Collapse in={showDetails}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ textAlign: "left", mt: 2 }}>
            {/* Component Stack */}
            {errorInfo?.componentStack && (
              <>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  Стек компонентов:
                </Typography>
                <Box
                  sx={{
                    bgcolor: theme.palette.grey[100],
                    p: 1.5,
                    borderRadius: 1,
                    overflow: "auto",
                    maxHeight: 200,
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                  }}
                >
                  <Typography
                    variant="caption"
                    component="pre"
                    sx={{ 
                      whiteSpace: "pre-wrap", 
                      wordBreak: "break-word",
                      margin: 0,
                      fontFamily: "monospace",
                    }}
                  >
                    {errorInfo.componentStack}
                  </Typography>
                </Box>
              </>
            )}

            {/* Error Stack */}
            {error?.stack && (
              <>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 2, mb: 1 }}>
                  Стек вызовов:
                </Typography>
                <Box
                  sx={{
                    bgcolor: theme.palette.grey[100],
                    p: 1.5,
                    borderRadius: 1,
                    overflow: "auto",
                    maxHeight: 300,
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                  }}
                >
                  <Typography
                    variant="caption"
                    component="pre"
                    sx={{ 
                      whiteSpace: "pre-wrap", 
                      wordBreak: "break-word",
                      margin: 0,
                      fontFamily: "monospace",
                    }}
                  >
                    {error.stack}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Collapse>
      </Paper>
    </Box>
  );
};;

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  showDetails: boolean;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      showDetails: false,
      errorInfo: undefined 
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Добавляем showDetails с значением по умолчанию
    return { 
      hasError: true, 
      error,
      showDetails: false,
      errorInfo: undefined
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorDisplay
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReload={this.handleReload}
          showDetails={this.state.showDetails}
          onToggleDetails={this.toggleDetails}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;