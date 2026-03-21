import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider, createTheme } from "@mui/material/styles" // Импорт провайдера темы и функции создания темы для Material UI.
import { BrowserRouter } from "react-router-dom" // Импорт маршрутизатора для управления навигацией.
import { ruRU } from "@mui/material/locale"
import "./index.css" // Импорт глобальных стилей приложения.

const theme = createTheme(
);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <BrowserRouter>
    {/* Обеспечиваем маршрутизацию для приложения. */}
    <ThemeProvider theme={theme}>
      {/* Обеспечиваем доступность темы для всех вложенных компонентов. */}
      <App />
    </ThemeProvider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
