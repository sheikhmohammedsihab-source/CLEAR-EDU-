import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loading } from './Loading';

interface AdminRouteProps {
  children: React.ReactElement;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading fullScreen text="Verifying admin credentials..." />;
  }

  // Not logged in -> redirect to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but not the designated Admin UID -> redirect to home
  if (!isAdmin) {
    console.warn(`Unauthorized admin route attempt by UID: ${currentUser.uid}`);
    return <Navigate to="/" replace />;
  }

  return children;
};
