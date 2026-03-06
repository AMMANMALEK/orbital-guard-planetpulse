import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

type ComplaintStatus = 'pending' | 'investigating' | 'resolved' | 'rejected';

interface Complaint {
  id: string;
  title: string;
  description: string;
  violation_type?: string;
  status: ComplaintStatus;
  submittedBy?: string;
  submittedAt?: string;
  region?: string;
  assignedOfficer?: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-500',
  investigating: 'bg-blue-500/20 text-blue-400',
  resolved: 'bg-emerald-500/20 text-emerald-500',
  rejected: 'bg-red-500/20 text-red-400',
};

const ALL_STATUSES: ComplaintStatus[] = ['pending', 'investigating', 'resolved', 'rejected'];

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/complaints')
      .then(res => setComplaints(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error('Failed to load complaints'));
  }, []);

  const filtered = useMemo(() => complaints.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (search && !`${c.title} ${c.description}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [complaints, statusFilter, search]);

  const handleStatusChange = async (id: string, status: ComplaintStatus) => {
    try {
      await api.patch(`/complaints/${id}`, { status });
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      toast.success('Status updated');
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Complaint Management</h1>
        <p className="text-muted-foreground">Review and manage citizen complaints</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Complaints
          </CardTitle>
          <div className="flex flex-wrap gap-3 pt-4">
            <Input
              placeholder="Search complaints..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <div className="flex flex-wrap gap-2">
              {(['all', ...ALL_STATUSES] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s as ComplaintStatus | 'all')}
                  className={`rounded-full px-3 py-1 text-xs font-bold capitalize border transition-all ${
                    statusFilter === s
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-transparent text-muted-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Region</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Submitted</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Change Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted-foreground">
                      No complaints found.
                    </td>
                  </tr>
                ) : filtered.map(c => (
                  <tr key={c.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{c.title || '—'}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{c.description || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground capitalize text-xs">
                      {c.violation_type?.replace(/_/g, ' ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{c.region || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${statusColors[c.status] || 'bg-muted text-muted-foreground'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.submittedAt || '—'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={c.status}
                        onChange={e => handleStatusChange(c.id, e.target.value as ComplaintStatus)}
                        className="rounded-lg border border-input bg-muted/30 px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {ALL_STATUSES.map(s => (
                          <option key={s} value={s} className="capitalize">{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
