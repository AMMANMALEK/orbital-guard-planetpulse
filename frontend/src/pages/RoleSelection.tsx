import { useNavigate, Navigate } from 'react-router-dom';
import { Shield, Eye, Leaf } from 'lucide-react';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const roles: { role: UserRole; title: string; desc: string; icon: typeof Shield; path: string }[] = [
  { role: 'admin', title: 'Administrator', desc: 'Full system control, user management, and monitoring configuration', icon: Shield, path: '/admin' },
  { role: 'officer', title: 'Environmental Officer', desc: 'Regional monitoring, detection analysis, and field operations', icon: Leaf, path: '/officer' },
  { role: 'viewer', title: 'Public Viewer', desc: 'Access public transparency portal and environmental reports', icon: Eye, path: '/viewer' },
];

const RoleSelection = () => {
  const { selectRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSelect = (role: UserRole, path: string) => {
    selectRole(role);
    navigate(path);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Select Your Role</h1>
          <p className="mt-2 text-muted-foreground">Choose a dashboard to access</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {roles.map((r, i) => (
            <motion.button key={r.role} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              onClick={() => handleSelect(r.role, r.path)}
              className="rounded-xl border border-border bg-card p-6 text-left hover:border-primary/50 hover:bg-card/80 transition-all group">
              <r.icon className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">{r.title}</h3>
              <p className="text-sm text-muted-foreground">{r.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
