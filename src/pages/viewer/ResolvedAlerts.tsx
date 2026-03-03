import { useState } from 'react';
import { Search } from 'lucide-react';
import { alerts } from '@/data/mockData';
import RiskBadge from '@/components/RiskBadge';

const ResolvedAlerts = () => {
  const [search, setSearch] = useState('');
  const resolved = alerts.filter(a => a.status === 'resolved');
  const filtered = resolved.filter(a => a.message.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Resolved Alerts</h1>
        <p className="text-muted-foreground">Completed environmental investigations</p>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search alerts..."
          className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
      </div>
      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-muted-foreground text-sm">No resolved alerts found.</p>}
        {filtered.map(a => (
          <div key={a.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-card-foreground">{a.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{a.region} • {a.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <RiskBadge level={a.severity} />
              <span className="rounded-full bg-risk-low/20 px-2.5 py-0.5 text-xs font-medium text-risk-low">Resolved</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResolvedAlerts;
