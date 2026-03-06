import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scan, AlertTriangle, Shield, MessageSquare, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '@/components/StatCard';
import MapView from '@/components/MapView';
import RiskBadge from '@/components/RiskBadge';
import { monthlyDetections } from '@/data/mockData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import api from '@/lib/api';
import { toast } from 'sonner';

const COLORS = ['#ef4444', '#f59e0b', '#22c55e'];

interface Stats {
  total_detections: number;
  active_alerts: number;
  pending_complaints: number;
  resolved_alerts: number;
  risk_distribution?: { name: string; value: number }[];
}

interface Alert {
  id: string;
  message: string;
  region: string;
  severity: 'high' | 'medium' | 'low';
  status: string;
  date: string;
}

const AdminDashboard = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, alertsRes] = await Promise.all([
          api.get('/stats'),
          api.get('/alerts?limit=5'),
        ]);
        setStats(statsRes.data);
        setRecentAlerts(alertsRes.data);
      } catch {
        toast.error('Failed to load dashboard data');
      }
    };
    fetchData();
  }, []);

  const chartRiskData = (stats?.risk_distribution && stats.risk_distribution.length > 0
    ? stats.risk_distribution
    : [
        { name: 'High Risk', value: 0 },
        { name: 'Medium Risk', value: 0 },
        { name: 'Low Risk', value: 0 },
      ]
  ).filter(r => r.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and monitoring status</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Detections" value={stats?.total_detections ?? '—'} icon={Scan} trend="+12% this month" trendUp />
        <StatCard title="Active Alerts" value={stats?.active_alerts ?? '—'} icon={AlertTriangle} trend="System alerts" />
        <StatCard title="Pending Complaints" value={stats?.pending_complaints ?? '—'} icon={MessageSquare} trend="Citizen reports" />
        <StatCard title="Resolved Incidents" value={stats?.resolved_alerts ?? '—'} icon={CheckCircle2} trend="Closed cases" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Monthly Detections</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyDetections}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(220,22%,10%)', border: '1px solid hsl(215,20%,18%)', borderRadius: '8px', color: '#e2e8f0' }} />
              <Line type="monotone" dataKey="detections" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chartRiskData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value"
                label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                labelLine={(props: any) => props.percent > 0 ? <line {...props} /> : <></>}>
                {chartRiskData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'hsl(220,22%,10%)', border: '1px solid hsl(215,20%,18%)', borderRadius: '8px', color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">Regional Overview</h3>
          <Select defaultValue="all" onValueChange={(v) => setSelectedRegion(v === 'all' ? undefined : v)}>
            <SelectTrigger className="w-[180px] bg-muted/20 border-border/50">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Global View</SelectItem>
              <SelectItem value="Western Ghats">Western Ghats</SelectItem>
              <SelectItem value="Sundarbans">Sundarbans</SelectItem>
              <SelectItem value="Aravalli Hills">Aravalli Hills</SelectItem>
              <SelectItem value="Kaziranga">Kaziranga</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <MapView className="h-[400px]" filterRegion={selectedRegion} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Recent Alerts</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 text-muted-foreground font-medium">Alert</th>
                <th className="pb-3 text-muted-foreground font-medium">Region</th>
                <th className="pb-3 text-muted-foreground font-medium">Severity</th>
                <th className="pb-3 text-muted-foreground font-medium">Status</th>
                <th className="pb-3 text-muted-foreground font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentAlerts.length === 0 ? (
                <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No alerts yet.</td></tr>
              ) : recentAlerts.slice(0, 5).map(a => (
                <tr key={a.id} className="border-b border-border/50">
                  <td className="py-3 text-card-foreground">{a.message}</td>
                  <td className="py-3 text-muted-foreground">{a.region}</td>
                  <td className="py-3"><RiskBadge level={a.severity} /></td>
                  <td className="py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${a.status === 'active' ? 'bg-destructive/20 text-destructive' : a.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-emerald-500/20 text-emerald-500'}`}>{a.status}</span></td>
                  <td className="py-3 text-muted-foreground">{a.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
