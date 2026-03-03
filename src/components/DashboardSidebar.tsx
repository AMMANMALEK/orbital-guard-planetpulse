import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Map, Scan, Bell, FileText, Settings,
  MapPin, Database, BarChart3, CheckCircle, ChevronLeft, ChevronRight, Satellite
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navItems = {
  admin: [
    { title: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { title: 'Users', path: '/admin/users', icon: Users },
    { title: 'Regions', path: '/admin/regions', icon: Map },
    { title: 'Detections', path: '/admin/detections', icon: Scan },
    { title: 'Alerts', path: '/admin/alerts', icon: Bell },
    { title: 'Reports', path: '/admin/reports', icon: FileText },
    { title: 'System', path: '/admin/system', icon: Settings },
  ],
  officer: [
    { title: 'Dashboard', path: '/officer', icon: LayoutDashboard },
    { title: 'My Region', path: '/officer/region', icon: MapPin },
    { title: 'Detections', path: '/officer/detections', icon: Scan },
    { title: 'Alerts', path: '/officer/alerts', icon: Bell },
    { title: 'Data', path: '/officer/data', icon: Database },
  ],
  viewer: [
    { title: 'Dashboard', path: '/viewer', icon: LayoutDashboard },
    { title: 'Charts', path: '/viewer/charts', icon: BarChart3 },
    { title: 'Resolved', path: '/viewer/alerts', icon: CheckCircle },
    { title: 'Reports', path: '/viewer/reports', icon: FileText },
  ],
};

const DashboardSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { role } = useAuth();
  const location = useLocation();
  const items = navItems[role || 'viewer'];

  return (
    <aside className={cn(
      'flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 flex-shrink-0',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Satellite className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-sidebar-foreground">PlanetPulse</span>
          </div>
        )}
        {collapsed && <Satellite className="h-6 w-6 text-primary mx-auto" />}
        <button onClick={() => setCollapsed(!collapsed)}
          className={cn("rounded-lg p-1.5 hover:bg-sidebar-accent text-sidebar-foreground", collapsed && "mx-auto mt-0")}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {items.map(item => {
            const isActive = location.pathname === item.path ||
              (item.path !== `/${role}` && location.pathname.startsWith(item.path));
            return (
              <li key={item.path}>
                <Link to={item.path}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive ? 'bg-primary text-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent',
                    collapsed && 'justify-center px-2'
                  )}>
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {!collapsed && (
        <div className="border-t border-sidebar-border p-3 text-xs text-muted-foreground text-center">
          Orbital Guard v3.2
        </div>
      )}
    </aside>
  );
};

export default DashboardSidebar;
