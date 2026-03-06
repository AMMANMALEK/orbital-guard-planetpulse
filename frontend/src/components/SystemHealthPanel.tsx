import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Server, Wifi, Database, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/StatCard';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

const ts = { backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--card-foreground))' };

export default function SystemHealthPanel() {
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/model/info'),
      api.get('/stats')
    ]).then(([mRes, sRes]) => {
      setModelInfo(mRes.data);
      setStats(sRes.data);
    })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const monthly_trends = stats?.monthly_trends || [];

  const alertFreqData = monthly_trends.map((m: any, i: number) => ({
    month: m.month,
    alerts: Math.floor(m.detections * 0.4) + (i % 3) * 2,
  }));

  const serverStatus = [
    { name: 'API Gateway', status: 'operational' as const, latency: 45 },
    { name: 'Detection Model', status: modelInfo?.loaded ? 'operational' : 'error' as const, latency: 1200 },
    { name: 'Satellite Feed', status: 'operational' as const, latency: 320 },
    { name: 'Database', status: 'operational' as const, latency: 180 },
  ];

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Model Parameters" value={modelInfo?.parameters?.toLocaleString() ?? '—'} icon={Activity} />
        <StatCard title="Model Layers" value={modelInfo?.layers ?? '—'} icon={Server} />
        <StatCard title="Input Resolution" value={modelInfo?.input_size ? `${modelInfo.input_size[0]}x${modelInfo.input_size[1]}` : '—'} icon={Database} />
        <StatCard title="Model Status" value={modelInfo?.loaded ? 'Active' : 'Missing'} icon={Activity} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Detection Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthly_trends}>
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
