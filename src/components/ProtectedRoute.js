import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Component for routes that require authentication
export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

// Component for routes that require admin role
export const AdminRoute = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return isAdmin() ? <Outlet /> : <Navigate to="/unauthorized" />;
};

// Component for routes that require employer role
export const EmployerRoute = () => {
  const { isAuthenticated, isEmployer } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return isEmployer() ? <Outlet /> : <Navigate to="/unauthorized" />;
};

// Component for routes that require either admin or employer role
export const StaffRoute = () => {
  const { isAuthenticated, isAdmin, isEmployer } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (isAdmin() || isEmployer()) ? <Outlet /> : <Navigate to="/unauthorized" />;
};
