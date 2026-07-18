import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-loading">Checking your session...</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

