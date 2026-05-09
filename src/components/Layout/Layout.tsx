import React from "react"
import { Box, CssBaseline } from "@mui/material"
// Импорт компонентов из Material UI: Box — контейнер для стилизации, CssBaseline — сброс стилей браузера.
import Header from "./Header"
import { useNavigate } from "react-router-dom"
import Footer from "./Footer"

interface LayoutProps {
  children: React.ReactNode
}
// Определение интерфейса для пропсов компонента Layout.
// Ожидается, что будет передан `children` (вложенные компоненты).

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Функциональный компонент Layout, который используется для отображения основной структуры приложения.

  const navigate = useNavigate()
  // Хук useNavigate из react-router-dom используется для программной навигации.

  const handleMenuItemClick = (path: string) => {
    navigate(path)
    // Функция для обработки кликов по пунктам меню. Принимает путь маршрута и выполняет переход.
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <CssBaseline />
      <Header />
      <Box
        component="main"
        sx={{
          flexGrow: 1, // Растягивается на всю доступную высоту
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
}

export default Layout
