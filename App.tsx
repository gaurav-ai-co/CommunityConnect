import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { ResidentDashboard } from './pages/ResidentDashboard';
import { GuardDashboard } from './pages/GuardDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserRole } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: UserRole[] }> = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to their own dashboard if they access wrong route
    if (user.role === UserRole.RESIDENT) return <Navigate to="/resident" replace />;
    if (user.role === UserRole.GUARD) return <Navigate to="/guard" replace />;
    if (user.role === UserRole.ADMIN) return <Navigate to="/admin" replace />;
  }

  return <Layout>{children}</Layout>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${user.role}`} />} />
      
      {/* Resident Routes */}
      <Route 
        path="/resident/*" 
        element={
          <ProtectedRoute roles={[UserRole.RESIDENT]}>
            <ResidentDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Guard Routes */}
      <Route 
        path="/guard" 
        element={
          <ProtectedRoute roles={[UserRole.GUARD]}>
            <GuardDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute roles={[UserRole.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Default Redirect */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
}
