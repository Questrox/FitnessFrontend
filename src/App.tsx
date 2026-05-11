import React, { useEffect } from 'react';
import logo from './logo.svg';
import './index.css';
import { useAuth, AuthProvider } from './context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Navigate, Routes, Route } from 'react-router-dom';
import Home from './components/Pages/Home';
import Layout from './components/Layout/Layout';
import MembershipsPage from './components/Pages/MembershipsPage';
import TrainingsPage from './components/Pages/TrainingsPage';
import SchedulePage from './components/Pages/SchedulePage';
import TeamPage from './components/Pages/TeamPage';
import ProfilePage from './components/Pages/ProfilePage';
import AdminPage from './components/Pages/AdminPage';
import { MembershipManagement } from './components/AdminTabs/MembershipManagement';
import { TrainingTypeManagement } from './components/AdminTabs/TrainingTypeManagement';
import { ClientManagement } from './components/AdminTabs/ClientManagement';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import "dayjs/locale/ru";
import { NotificationsManagement } from './components/AdminTabs/NotificationsManagement';
import { CoachManagement } from './components/AdminTabs/CoachManagement';
import dayjs from 'dayjs';
import ErrorBoundary from './components/Layout/ErrorBoundary';
import { SnackbarProvider, useSnackbar } from './context/SnackbarContext';

enum UserRole {
  Admin = "Admin",
  User = "User",
  Coach = "Coach"
}

dayjs.locale("ru");

const ProtectedRoute: React.FC<{
  children: React.ReactElement;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, isLoading, userRole } = useAuth();
  const { showSnackbar } = useSnackbar();

  const isUnauthorized =
    !isLoading &&
    (!user ||
      (allowedRoles &&
        allowedRoles.length > 0 &&
        (!userRole || !allowedRoles.includes(userRole))));

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      showSnackbar(
        "Недостаточно прав, выполните вход!",
        "error"
      );
    } else if (
      allowedRoles &&
      allowedRoles.length > 0 &&
      (!userRole || !allowedRoles.includes(userRole))
    ) {
      showSnackbar(
        "У вас недостаточно прав для доступа к этой странице",
        "error"
      );
    }
  }, [isLoading, user, userRole]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 150,
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isUnauthorized) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <SnackbarProvider>
        <AuthProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru" localeText={{
            fieldDayPlaceholder: () => "ДД",
            fieldMonthPlaceholder: () => "ММ",
            fieldYearPlaceholder: () => "ГГГГ",
            fieldHoursPlaceholder: () => "чч",
            fieldMinutesPlaceholder: () => "мм",
            cancelButtonLabel: "Отмена",
            okButtonLabel: "ОК",
            todayButtonLabel: "Сегодня",
          }}>
            <Layout>
              <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/memberships" element={<MembershipsPage/>}/>
                <Route path="/trainings" element={<TrainingsPage/>}/>
                <Route path="/schedule" element={<SchedulePage/>}/>
                <Route path="/team" element={<TeamPage/>}/>
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage key="my-profile"/>
                  </ProtectedRoute>
                }/>
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.Admin]}>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="memberships" replace />} />
                  <Route path="memberships" element={<MembershipManagement />} />
                  <Route path="training-types" element={<TrainingTypeManagement />} />
                  <Route path="clients/*" element={<ClientManagement/>} />
                  <Route path="coaches" element={<CoachManagement/>} />
                  <Route path="notifications" element={<NotificationsManagement/>} />
                </Route>
                <Route path="profiles/:id" element={
                  <ProtectedRoute allowedRoles={[UserRole.Admin]}>
                    <ProfilePage key="client-profile"/>
                  </ProtectedRoute>
                  }/>
              </Routes>
            </Layout>
          </LocalizationProvider>
        </AuthProvider>
      </SnackbarProvider>
    </ErrorBoundary>
  );
}

export default App;
