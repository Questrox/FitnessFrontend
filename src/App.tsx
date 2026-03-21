import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useAuth, AuthProvider } from './context/AuthContext';
import { CircularProgress } from '@mui/material';
import { Navigate } from 'react-router-dom';
import Home from './components/Pages/Home';
import Layout from './components/Layout/Layout';

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
    return <Navigate to="/" replace />;
  }

  return children;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Layout>
        <Home></Home>
      </Layout>
    </AuthProvider>
  );
}

export default App;
