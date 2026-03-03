import { Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

const DashboardNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 flex-shrink-0">
      <h2 className="text-lg font-semibold text-card-foreground capitalize">
        {user?.role || 'User'} Panel
      </h2>
      <div className="flex items-center gap-3">
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-lg p-2 hover:bg-muted text-muted-foreground transition-colors">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button className="relative rounded-lg p-2 hover:bg-muted text-muted-foreground transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground font-bold">3</span>
        </button>
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground hidden sm:inline">{user?.name || 'User'}</span>
        </div>
        <button onClick={handleLogout} className="rounded-lg p-2 hover:bg-muted text-muted-foreground transition-colors">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default DashboardNavbar;
