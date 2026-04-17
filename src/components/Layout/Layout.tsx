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
    <>
      {/* Корневой контейнер для всей структуры компонента. */}
      <CssBaseline />
      {/* CssBaseline отвечает за сброс стандартных стилей браузера. */}
      <Header />
      {/* Компонент для отображения шапки приложения. */}
      <Box
        component="main"
        // Основная область страницы, где будет отображаться содержимое `children`.
        sx={{
          flexGrow: 1, // Основной контейнер занимает оставшееся пространство.
          minHeight: 563
        }}
      >
        {children}
        {/* Вложенные компоненты, которые рендерятся внутри Layout. */}
      </Box>
      <Footer/>
    </>
  )
}

export default Layout
