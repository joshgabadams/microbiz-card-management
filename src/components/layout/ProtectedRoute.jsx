import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageHeader from './PageHeader';
import { routePermission } from '../../config/permissions.js';
import { EmptyState, LoadingState } from '../ui/DataState';

export default function ProtectedRoute() {
  const { session, sessionVersion, busy } = useAuth();
  const location = useLocation();
  if (busy) return <LoadingState label="Checking your session…" />;
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet key={sessionVersion} />;
}

export function PermissionRoute() {
  const { can } = useAuth();
  const location = useLocation();
  const permission = routePermission(location.pathname);
  if (permission && !can(permission)) return <div className="page"><PageHeader title="Access restricted" description="This workspace requires additional permission." /><EmptyState title="Permission required" description="Your current permissions do not include this workspace. Contact your administrator if you need access." /></div>;
  return <Outlet />;
}
