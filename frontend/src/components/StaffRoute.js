import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Restricts access to staff users only (is_staff === true)
const StaffRoute = ({ redirectTo = '/login' }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  if (!user?.is_staff) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default StaffRoute;
