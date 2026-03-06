import { useState, useEffect } from 'react';
import { Globe, AlertTriangle, Leaf, TreeDeciduous } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { riskDistribution } from '@/data/mockData';
import api from '@/lib/api';

const COLORS = ['#ef4444', '#f59e0b', '#22c55e'];

interface Stats {
  total_detections: number;
  active_alerts: number;
  resolved_alerts: number;
  risk_distribution?: { name: string; value: number }[];
}

const ViewerDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/stats').then(res => setStats(res.data)).catch(() => {});
  }, []);

  const chartData = (stats?.risk_distribution && stats.risk_distribution.some(r => r.value > 0)
    ? stats.risk_distribution
    : riskDistribution
  ).filter(r => r.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Public Dashboard</h1>
          <p className="text-muted-foreground">Environmental transparency portal</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Detections" value={stats?.total_detections ?? '—'} icon={Globe} />
        <StatCard title="Active Alerts" value={stats?.active_alerts ?? '—'} icon={AlertTriangle} />
        <StatCard title="Resolved Incidents" value={stats?.resolved_alerts ?? '—'} icon={Leaf} />
        <StatCard title="AI Model" value="Online" icon={TreeDeciduous} />
      </div>

      <div className="grid gap-6">
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Risk Summary</h3>
          <div className="flex-grow flex items-center justify-center">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} dataKey="value"
                label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                labelLine={(props: any) => props.percent > 0 ? <line {...props} /> : <></>}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(220,22%,10%)', border: '1px solid hsl(215,20%,18%)', borderRadius: '8px', color: '#e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Legend</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-[#ef4444]" /><span className="text-xs uppercase font-mono">Critical</span></div>
              <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-[#f59e0b]" /><span className="text-xs uppercase font-mono">High Risk</span></div>
              <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-[#22c55e]" /><span className="text-xs uppercase font-mono">Low Risk</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewerDashboard;
