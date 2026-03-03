import { useState } from 'react';
import { alerts } from '@/data/mockData';
import RiskBadge from '@/components/RiskBadge';

const OfficerAlerts = () => {
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const regionAlerts = alerts.filter(a => a.region === 'Western Ghats' || a.region === 'Sundarbans');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Regional Alerts</h1>
        <p className="text-muted-foreground">Manage and investigate alerts</p>
      </div>
      <div className="space-y-4">
        {regionAlerts.map(a => (
          <div key={a.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-card-foreground">{a.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{a.region} • {a.date}</p>
              </div>
              <RiskBadge level={a.severity} />
            </div>
            <div className="flex gap-2">
              <select className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none">
                <option>Active</option><option>Investigating</option><option>Resolved</option>
              </select>
              <button onClick={() => setSelectedAlert(selectedAlert === a.id ? null : a.id)} className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20">
                {selectedAlert === a.id ? 'Close Notes' : 'Add Notes'}
              </button>
            </div>
            {selectedAlert === a.id && (
              <textarea placeholder="Add field notes..." rows={3}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none text-sm" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OfficerAlerts;
