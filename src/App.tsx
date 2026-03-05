import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import DashboardLayout from "@/layouts/DashboardLayout";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import RoleSelection from "@/pages/RoleSelection";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagement from "@/pages/admin/UserManagement";
import RegionControl from "@/pages/admin/RegionControl";
import DetectionControl from "@/pages/admin/DetectionControl";
import AlertManagement from "@/pages/admin/AlertManagement";
import Reports from "@/pages/admin/Reports";
import SystemControl from "@/pages/admin/SystemControl";

import OfficerDashboard from "@/pages/officer/OfficerDashboard";
import AssignedRegion from "@/pages/officer/AssignedRegion";
import ImageDetection from "@/pages/officer/ImageDetection";
import OfficerAlerts from "@/pages/officer/OfficerAlerts";
import DataAccess from "@/pages/officer/DataAccess";

import ViewerDashboard from "@/pages/viewer/ViewerDashboard";
import ViewerCharts from "@/pages/viewer/ViewerCharts";
import ResolvedAlerts from "@/pages/viewer/ResolvedAlerts";
import PublicReports from "@/pages/viewer/PublicReports";

import About from "@/pages/About";
import Team from "@/pages/Team";
import Roadmap from "@/pages/Roadmap";
import NotFound from "@/pages/NotFound";

import { AppProvider } from "@/contexts/AppContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/select-role" element={<RoleSelection />} />

              <Route path="/admin" element={<DashboardLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="regions" element={<RegionControl />} />
                <Route path="detections" element={<DetectionControl />} />
                <Route path="alerts" element={<AlertManagement />} />
                <Route path="reports" element={<Reports />} />
                <Route path="system" element={<SystemControl />} />
              </Route>

              <Route path="/officer" element={<DashboardLayout />}>
                <Route index element={<OfficerDashboard />} />
                <Route path="region" element={<AssignedRegion />} />
                <Route path="detections" element={<ImageDetection />} />
                <Route path="alerts" element={<OfficerAlerts />} />
                <Route path="data" element={<DataAccess />} />
              </Route>

              <Route path="/viewer" element={<DashboardLayout />}>
                <Route index element={<ViewerDashboard />} />
                <Route path="charts" element={<ViewerCharts />} />
                <Route path="alerts" element={<ResolvedAlerts />} />
                <Route path="reports" element={<PublicReports />} />
              </Route>

              <Route path="/about" element={<About />} />
              <Route path="/team" element={<Team />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
