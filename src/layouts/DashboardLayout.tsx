import { Outlet } from 'react-router-dom';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardNavbar from '@/components/DashboardNavbar';

const DashboardLayout = () => (
  <div className="flex h-screen overflow-hidden bg-background">
    <DashboardSidebar />
    <div className="flex flex-1 flex-col overflow-hidden">
      <DashboardNavbar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  </div>
);

export default DashboardLayout;
