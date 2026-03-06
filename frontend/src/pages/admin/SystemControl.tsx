import { useState, useEffect } from 'react';
import { systemLogs } from '@/data/mockData';
import SystemHealthPanel from '@/components/SystemHealthPanel';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

const SystemControl = () => {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">System Control</h1>
        <p className="text-muted-foreground">Model performance, logs, and configuration</p>
      </div>

      <SystemHealthPanel />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-card-foreground">Model Configuration</h3>
          {loading ? (
             <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex justify-between rounded-lg bg-muted p-3">
                  <span className="text-sm text-muted-foreground">Model Path</span>
                  <span className="text-sm font-mono text-card-foreground line-clamp-1">{modelInfo?.path?.split('/').pop() ?? '—'}</span>
                </div>
                <div className="flex justify-between rounded-lg bg-muted p-3">
                  <span className="text-sm text-muted-foreground">Total Parameters</span>
                  <span className="text-sm font-mono text-card-foreground">{modelInfo?.parameters?.toLocaleString() ?? '—'}</span>
                </div>
                <div className="flex justify-between rounded-lg bg-muted p-3">
                  <span className="text-sm text-muted-foreground">Target Classes</span>
                  <span className="text-sm font-mono text-card-foreground">{modelInfo?.classes?.join(', ') ?? '—'}</span>
                </div>
              </div>
            </>
          )}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-card-foreground">Satellite Source</label>
          <select className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none">
            <option>Sentinel-2 (ESA)</option>
            <option>Google Earth Engine</option>
            <option>Landsat-9 (NASA)</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">System Activity Feed</h3>
        <div className="h-[340px] overflow-y-auto space-y-2 pr-2">
          {stats?.system_logs?.map((log: any) => (
            <div key={log.id} className="rounded-lg bg-muted p-3 text-xs font-mono">
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-block h-2 w-2 rounded-full ${log.level === 'error' ? 'bg-risk-high' : log.level === 'warning' ? 'bg-risk-medium' : 'bg-risk-low'}`} />
                <span className="text-muted-foreground">{log.timestamp}</span>
                <span className={`uppercase font-semibold ${log.level === 'error' ? 'text-risk-high' : log.level === 'warning' ? 'text-risk-medium' : 'text-risk-low'}`}>{log.level}</span>
              </div>
              <p className="text-card-foreground">{log.message}</p>
            </div>
          ))}
          {(!stats?.system_logs || stats.system_logs.length === 0) && (
            <p className="text-center py-12 text-muted-foreground text-sm">No recent activity detected.</p>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default SystemControl;
