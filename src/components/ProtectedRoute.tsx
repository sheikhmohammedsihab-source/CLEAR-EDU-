import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loading } from './Loading';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading fullScreen text="Verifying session..." />;
  }

  if (!currentUser) {
    // Redirect to login page and preserve intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
