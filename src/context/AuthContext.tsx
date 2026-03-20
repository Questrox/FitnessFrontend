import React, { createContext, useContext, useState, useEffect } from "react"
import { LoginResult, LoginModel } from "../api/g"
import { apiClient } from "../api/apiClient"

interface AuthContextType {
  user: LoginResult | null
  // Данные авторизованного пользователя или `null`, если пользователь не авторизован.

  login: (userName: string, password: string) => Promise<void>
  // Функция для выполнения входа. Возвращает промис.

  logout: () => Promise<void>
  // Функция для выхода из системы.

  isAdmin: boolean
  // Флаг, указывающий, является ли пользователь администратором.

  isCoach: boolean
  // Флаг, укаазывающий, является ли пользователь тренером

  isLoading: boolean //Чтобы при перезагрузке не выводилось всегда сообщение о том, что нужно сделать вход
}

enum UserRole {
  Admin = "admin",
  User = "user",
  Coach = "coach",
}

const AuthContext = createContext<AuthContextType | null>(null)
// Создаем контекст `AuthContext` с начальным значением `null`.

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // `AuthProvider` — компонент, который предоставляет данные о пользователе и методы авторизации всем вложенным компонентам.

  const tokenKey = "jwtToken";
  const [user, setUser] = useState<LoginResult | null>(null)
  // Локальное состояние для хранения информации о текущем пользователе.

  const [isLoading, setIsLoading] = useState(true)


  useEffect(() => {
    // При первой загрузке проверяем, есть ли сохраненный токен.
    const token = localStorage.getItem(tokenKey);
    if (token) {
      const storedUser = localStorage.getItem("user")
      // Если есть токен, пробуем загрузить информацию о пользователе из локального хранилища.
      if (storedUser) setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])
  // Пустой массив зависимостей (`[]`) означает, что этот эффект выполнится только один раз — при монтировании компонента.

  const login = async (userName: string, password: string) => {
    try {
      // Функция входа в систему. Отправляет данные на сервер и сохраняет ответ.
      const loginModel = new LoginModel({userName, password});
      const response = await apiClient.login(loginModel)
      if (!response.token) throw new Error("Не получен токен");
      localStorage.setItem(tokenKey, response.token!);
      // Сохраняем токен авторизации в локальном хранилище через `authService`.

      localStorage.setItem("user", JSON.stringify(response))
      // Сохраняем данные пользователя в локальном хранилище.
      setUser(response)
      // Обновляем состояние пользователя.
    } catch (error) {
      console.error("Ошибка входа:", error)
      throw error // Или вернуть пользовательское сообщение об ошибке.
    }
  }

  const logout = async () => {

    await apiClient.logout();
    localStorage.removeItem(tokenKey);
    // Удаляем токен из хранилища.

    localStorage.removeItem("user")
    // Удаляем данные пользователя из локального хранилища.
    setUser(null)
    // Сбрасываем состояние пользователя.
  }

  const isAdmin = user?.userRole === UserRole.Admin
  const isCoach = user?.userRole === UserRole.Coach
  // Проверяем, является ли пользователь администратором (определяется по полю `userRole`).

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isCoach, isLoading }}>
      {/* Передаем данные о пользователе и методы авторизации в контекст. */}
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  // Кастомный хук для доступа к данным контекста.
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
    // Генерируем ошибку, если хук используется вне провайдера контекста.
  }
  return context
  // Возвращаем данные контекста.
}
