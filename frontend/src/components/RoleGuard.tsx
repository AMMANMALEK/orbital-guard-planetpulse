import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '@/contexts/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ROLE_DASHBOARDS: Record<UserRole, string> = {
  admin: '/admin',
  officer: '/officer',
  viewer: '/viewer',
};

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(role)) {
    const dashboard = ROLE_DASHBOARDS[role];
    return <Navigate to={dashboard} replace />;
  }

  return <>{children}</>;
}
