import { motion } from 'framer-motion';
import { MapPin, AlertTriangle, Shield, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '@/components/StatCard';
import MapView from '@/components/MapView';
import { monthlyDetections, mapPoints, alerts } from '@/data/mockData';
import RiskBadge from '@/components/RiskBadge';

const OfficerDashboard = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Officer Dashboard</h1>
      <p className="text-muted-foreground">Western Ghats – Regional Overview</p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Assigned Region" value="Western Ghats" icon={MapPin} />
      <StatCard title="Active Alerts" value="4" icon={AlertTriangle} trend="+2 today" trendUp={false} />
      <StatCard title="High Risk Cases" value="3" icon={Shield} />
      <StatCard title="Detection Accuracy" value="92.3%" icon={Activity} />
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Detection Trend</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={monthlyDetections}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(220,22%,10%)', border: '1px solid hsl(215,20%,18%)', borderRadius: '8px', color: '#e2e8f0' }} />
            <Line type="monotone" dataKey="detections" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Region Map</h3>
        <MapView points={mapPoints.filter(p => p.label.includes('Kudremukh') || p.label.includes('Nilgiri') || p.label.includes('Wayanad'))} className="h-[280px]" />
      </motion.div>
    </div>
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Regional Alerts</h3>
      <div className="space-y-3">
        {alerts.filter(a => a.region === 'Western Ghats').map(a => (
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
  </div>
);

export default OfficerDashboard;
