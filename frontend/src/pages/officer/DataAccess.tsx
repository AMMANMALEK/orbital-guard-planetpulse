import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import RiskBadge from '@/components/RiskBadge';
import api from '@/lib/api';
import { toast } from 'sonner';

type RiskLevel = 'high' | 'medium' | 'low';

interface Detection {
  id: string;
  location: string;
  prediction: string;
  risk_score: number;
  confidence: number;
  status: string;
  timestamp: string;
  region: string;
}

const DataAccess = () => {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const fetchDetections = async () => {
      try {
        const res = await api.get('/detections');
        setDetections(res.data);
      } catch {
        toast.error('Failed to load detections');
      } finally {
        setLoading(false);
      }
    };
    fetchDetections();
  }, []);

  const riskFromScore = (score: number): RiskLevel =>
    score >= 80 ? 'high' : score >= 65 ? 'medium' : 'low';

  const filtered = detections.filter(d => {
    if (dateFrom && d.timestamp && d.timestamp < dateFrom) return false;
    if (dateTo && d.timestamp && d.timestamp > dateTo + 'T23:59:59') return false;
    return true;
  });

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
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading detections...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No detections found.</td></tr>
              ) : filtered.map(d => (
                <tr key={d.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-card-foreground">{d.location}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{d.prediction?.replace(/-/g, ' ')}</td>
                  <td className="px-4 py-3"><RiskBadge level={riskFromScore(d.risk_score)} /></td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${d.status === 'detected' ? 'bg-destructive/20 text-destructive' : d.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-emerald-500/20 text-emerald-500'}`}>{d.status}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{d.timestamp?.split('T')[0]}</td>
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
