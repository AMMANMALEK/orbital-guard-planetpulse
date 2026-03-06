import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, AlertTriangle, Shield, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '@/components/StatCard';
import RiskBadge from '@/components/RiskBadge';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import MapView from '@/components/MapView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type RiskLevel = 'high' | 'medium' | 'low';

interface Alert {
  id: string;
  message: string;
  region: string;
  severity: RiskLevel;
  status: string;
  date: string;
}

interface Stats {
  active_alerts: number;
  total_detections: number;
  monthly_trends?: { month: string; detections: number }[];
  accuracy?: number;
}

const OfficerDashboard = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get('/alerts'),
      api.get('/stats'),
    ]).then(([aRes, sRes]) => {
      setAlerts(aRes.data);
      setStats(sRes.data);
    }).catch(() => {});
  }, [user]);

  const regionAlerts = alerts.filter(a => user?.assigned_region?.name ? a.region === user.assigned_region.name : true);

  const [complaints, setComplaints] = useState<any[]>([]);

  useEffect(() => {
    api.get('/complaints?mine=false').then(res => setComplaints(res.data));
  }, []);

  const stats_meta = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'assigned' || c.status === 'pending').length,
    investigating: complaints.filter(c => c.status === 'investigating').length,
    resolved: complaints.filter(c => c.status === 'resolved' || c.status === 'confirmed').length
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Officer Dashboard</h1>
        <p className="text-muted-foreground">
          {user?.assigned_city ? `${user.assigned_city}, ` : ''}{user?.assigned_state ?? '—'} – Regional Overview
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Assigned City" value={user?.assigned_city ?? '—'} icon={MapPin} />
        <StatCard title="Pending" value={stats_meta.pending} icon={AlertTriangle} />
        <StatCard title="In Progress" value={stats_meta.investigating} icon={Activity} />
        <StatCard title="Resolved" value={stats_meta.resolved} icon={Shield} />
      </div>
      <div className="grid gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Detection Trend</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={stats?.monthly_trends || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(220,22%,10%)', border: '1px solid hsl(215,20%,18%)', borderRadius: '8px', color: '#e2e8f0' }} />
              <Line type="monotone" dataKey="detections" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Regional Alerts</h3>
        <div className="space-y-3">
          {regionAlerts.length === 0 ? (
            <p className="text-muted-foreground text-sm">No regional alerts found.</p>
          ) : regionAlerts.map(a => (
            <div key={a.id} className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div>
                <p className="text-sm font-medium text-card-foreground">{a.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{a.date}</p>
              </div>
              <RiskBadge level={a.severity} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/20">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Regional Coverage Map
          </h3>
        </div>
        <div className="h-[500px]">
          <MapView filterRegion={user?.assigned_city} />
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
