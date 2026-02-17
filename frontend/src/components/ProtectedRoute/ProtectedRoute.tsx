import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import type { JSX } from 'react';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;