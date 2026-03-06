import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Server, Wifi, Database } from 'lucide-react';
import { modelPerformance, monthlyDetections } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/StatCard';
import { cn } from '@/lib/utils';

const ts = { backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--card-foreground))' };

const serverStatus = [
  { name: 'API Gateway', status: 'operational' as const, latency: 45 },
  { name: 'Detection Model', status: 'operational' as const, latency: 1200 },
  { name: 'Satellite Feed', status: 'operational' as const, latency: 320 },
  { name: 'Database', status: 'degraded' as const, latency: 180 },
];

export default function SystemHealthPanel() {
  const alertFreqData = monthlyDetections.map((m, i) => ({
    month: m.month,
    alerts: Math.floor(m.detections * 0.4) + (i % 3) * 2,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Model Accuracy" value={`${modelPerformance.accuracy}%`} icon={Activity} />
        <StatCard title="Precision" value={`${modelPerformance.precision}%`} icon={Server} />
        <StatCard title="Recall" value={`${modelPerformance.recall}%`} icon={Database} />
        <StatCard title="F1 Score" value={`${modelPerformance.f1Score}%`} icon={Activity} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Detection Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyDetections}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={ts} />
                <Line type="monotone" dataKey="detections" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alert Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={alertFreqData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={ts} />
                <Bar dataKey="alerts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Server Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {serverStatus.map(s => (
              <div key={s.name} className="flex items-center gap-4 rounded-lg border p-4">
                <div className={cn(
                  'rounded-full p-2',
                  s.status === 'operational' ? 'bg-risk-low/20' : 'bg-risk-medium/20'
                )}>
                  <Wifi className={cn(
                    'h-5 w-5',
                    s.status === 'operational' ? 'text-risk-low' : 'text-risk-medium'
                  )} />
                </div>
                <div>
                  <p className="font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{s.status}</p>
                  <p className="text-xs text-muted-foreground">{s.latency}ms</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
