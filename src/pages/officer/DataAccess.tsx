import { useState } from 'react';
import { Download } from 'lucide-react';
import { detections } from '@/data/mockData';
import RiskBadge from '@/components/RiskBadge';
import type { RiskLevel } from '@/data/mockData';

const DataAccess = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const filtered = detections.filter(d => d.region === 'Western Ghats' || d.region === 'Sundarbans');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data Access</h1>
          <p className="text-muted-foreground">Regional detection history and reports</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Download className="h-4 w-4" /> Download Report
        </button>
      </div>
      <div className="flex gap-4">
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          className="rounded-lg border border-input bg-background px-4 py-2 text-foreground text-sm focus:border-primary focus:outline-none" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          className="rounded-lg border border-input bg-background px-4 py-2 text-foreground text-sm focus:border-primary focus:outline-none" />
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Location</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Type</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Risk</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Status</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-card-foreground">{d.location}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{d.type.replace('-', ' ')}</td>
                  <td className="px-4 py-3"><RiskBadge level={(d.riskScore >= 80 ? 'high' : d.riskScore >= 65 ? 'medium' : 'low') as RiskLevel} /></td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${d.status === 'detected' ? 'bg-destructive/20 text-destructive' : d.status === 'investigating' ? 'bg-risk-medium/20 text-risk-medium' : 'bg-risk-low/20 text-risk-low'}`}>{d.status}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{d.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataAccess;
