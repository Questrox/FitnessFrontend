import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider, createTheme } from "@mui/material/styles" // Импорт провайдера темы и функции создания темы для Material UI.
import { BrowserRouter } from "react-router-dom" // Импорт маршрутизатора для управления навигацией.
import { ConfirmProvider } from 'material-ui-confirm';
import { ruRU } from "@mui/material/locale"
import "@fontsource/inter";
import "./index.css" // Импорт глобальных стилей приложения.

const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#5B5BD6",
    },

    secondary: {
      main: "#7C4DFF",
    },

    background: {
      default: "#F5F7FB",
      paper: "#FFFFFF",
    },

    success: {
      main: "#2a8f2f",
    },

    error: {
      main: "#D32F2F",
    },

    warning: {
      main: "#ED6C02",
    },

    text: {
      primary: "#1E293B",
      secondary: "#64748B",
    },

    divider: "#E2E8F0",
  },

  shape: {
    borderRadius: 12,
  },

  typography: {
    fontFamily: `"inter", sans-serif`,
  },

  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <BrowserRouter>
    {/* Обеспечиваем маршрутизацию для приложения. */}
    <ThemeProvider theme={theme}>
      {/* Обеспечиваем доступность темы для всех вложенных компонентов. */}
      <ConfirmProvider 
      defaultOptions={{
        title: "Вы уверены?",
        confirmationText: "ОК",
        cancellationText: "Отмена"
      }}
      >
        <App />
      </ConfirmProvider>
    </ThemeProvider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
