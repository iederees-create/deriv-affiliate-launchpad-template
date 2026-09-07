import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { isAdminUser } from '../lib/admin';

export function RequireAdmin() {
  const { user, loading } = useAuth();
  if (loading) return <div className="member-loading">Checking administrator access…</div>;
  return isAdminUser(user) ? <Outlet /> : <Navigate to="/members" replace />;
}
