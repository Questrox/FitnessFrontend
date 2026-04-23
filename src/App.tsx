import React from 'react';
import logo from './logo.svg';
import './index.css';
import { useAuth, AuthProvider } from './context/AuthContext';
import { CircularProgress, Typography } from '@mui/material';
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

enum UserRole {
  Admin = "Admin",
  User = "User",
  Coach = "Coach"
}

const ProtectedRoute: React.FC<{ children: React.ReactElement, allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading, userRole } = useAuth();
  
  if (isLoading) return <CircularProgress/>
  if (!user) {
    alert("Недостаточно прав. Выполните вход!");
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && (!userRole || !allowedRoles.includes(userRole))) {
    alert("У вас недостаточно прав для доступа к этой странице.");
    console.log(userRole);
    console.log(allowedRoles);
    return <Navigate to="/" replace />;
  }

  return children;
};

const App: React.FC = () => {
  return (
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
              <ProtectedRoute allowedRoles={[UserRole.User]}>
                <ProfilePage/>
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
                <ProfilePage/>
              </ProtectedRoute>
              }/>
          </Routes>
        </Layout>
      </LocalizationProvider>
    </AuthProvider>
  );
}

export default App;
