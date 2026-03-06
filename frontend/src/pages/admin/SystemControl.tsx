import { modelPerformance, systemLogs } from '@/data/mockData';
import SystemHealthPanel from '@/components/SystemHealthPanel';

const SystemControl = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">System Control</h1>
      <p className="text-muted-foreground">Model performance, logs, and configuration</p>
    </div>

    <SystemHealthPanel />

    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-card-foreground">Model Configuration</h3>
        <div className="space-y-3">
          <div className="flex justify-between rounded-lg bg-muted p-3"><span className="text-sm text-muted-foreground">Model Version</span><span className="text-sm font-mono text-card-foreground">{modelPerformance.modelVersion}</span></div>
          <div className="flex justify-between rounded-lg bg-muted p-3"><span className="text-sm text-muted-foreground">Last Trained</span><span className="text-sm font-mono text-card-foreground">{modelPerformance.lastTrained}</span></div>
          <div className="flex justify-between rounded-lg bg-muted p-3"><span className="text-sm text-muted-foreground">Dataset Size</span><span className="text-sm font-mono text-card-foreground">{modelPerformance.datasetSize}</span></div>
        </div>
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
        <h3 className="text-lg font-semibold text-card-foreground mb-4">System Logs</h3>
        <div className="h-[340px] overflow-y-auto space-y-2 pr-2">
          {systemLogs.map(log => (
            <div key={log.id} className="rounded-lg bg-muted p-3 text-xs font-mono">
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-block h-2 w-2 rounded-full ${log.level === 'error' ? 'bg-risk-high' : log.level === 'warning' ? 'bg-risk-medium' : 'bg-risk-low'}`} />
                <span className="text-muted-foreground">{log.timestamp}</span>
                <span className={`uppercase font-semibold ${log.level === 'error' ? 'text-risk-high' : log.level === 'warning' ? 'text-risk-medium' : 'text-risk-low'}`}>{log.level}</span>
              </div>
              <p className="text-card-foreground">{log.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default SystemControl;
