import { useState } from 'react';
import { alerts as initialAlerts } from '@/data/mockData';
import RiskBadge from '@/components/RiskBadge';

const AlertManagement = () => {
  const [filter, setFilter] = useState<string>('all');
  const filtered = filter === 'all' ? initialAlerts : initialAlerts.filter(a => a.severity === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alert Management</h1>
          <p className="text-muted-foreground">Monitor and manage system alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter:</span>
          {['all', 'high', 'medium', 'low'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Risk Threshold</p>
          <input type="range" min="0" max="100" defaultValue="70" className="w-full mt-2 accent-primary" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>0</span><span>50</span><span>100</span></div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Active Alerts</p>
          <p className="text-2xl font-bold text-card-foreground mt-1">{initialAlerts.filter(a => a.status === 'active').length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Resolved Today</p>
          <p className="text-2xl font-bold text-card-foreground mt-1">{initialAlerts.filter(a => a.status === 'resolved').length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Alert</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Region</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Severity</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Status</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Date</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-3 text-card-foreground">{a.message}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.region}</td>
                  <td className="px-4 py-3"><RiskBadge level={a.severity} /></td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${a.status === 'active' ? 'bg-destructive/20 text-destructive' : a.status === 'investigating' ? 'bg-risk-medium/20 text-risk-medium' : 'bg-risk-low/20 text-risk-low'}`}>{a.status}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{a.date}</td>
                  <td className="px-4 py-3 flex gap-1">
                    <button className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20">Resolve</button>
                    <button className="rounded bg-risk-medium/10 px-2 py-1 text-xs font-medium text-risk-medium hover:bg-risk-medium/20">Reopen</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AlertManagement;
