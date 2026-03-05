import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import RiskBadge from '@/components/RiskBadge';
import { Edit2, ShieldAlert, CheckCircle2, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Alert, RiskLevel } from '@/data/mockData';

const AlertManagement = () => {
  const { alerts, updateAlert } = useAppContext();
  const [filter, setFilter] = useState<string>('all');
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);

  const handleStatusChange = (id: string, newStatus: Alert['status']) => {
    updateAlert(id, { status: newStatus });
    toast.success(`Alert marked as ${newStatus}`);
  };

  const handleEditSave = () => {
    if (editingAlert) {
      updateAlert(editingAlert.id, {
        message: editingAlert.message,
        severity: editingAlert.severity
      });
      toast.success("Alert intelligence updated");
      setEditingAlert(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alert Management</h1>
          <p className="text-muted-foreground">Monitor and broadcast system intelligence</p>
        </div>
        <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-xl border border-border/50">
          {['all', 'high', 'medium', 'low'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-tighter transition-all ${filter === f ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <ShieldAlert className="h-4 w-4" />
            <p className="text-xs font-black uppercase tracking-widest">Risk Analysis Threshold</p>
          </div>
          <input type="range" min="0" max="100" defaultValue="70" className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" />
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground"><span>SENSITIVE</span><span>BALANCED</span><span>STRICT</span></div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Missions</p>
          <p className="text-3xl font-black text-foreground mt-2">{alerts.filter(a => a.status === 'active').length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resolved Cycle</p>
          <p className="text-3xl font-black text-emerald-500 mt-2">{alerts.filter(a => a.status === 'resolved').length}</p>
        </div>
      </div>

      {editingAlert && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Edit Alert Intelligence</h3>
              <button onClick={() => setEditingAlert(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Intelligence Message</label>
                <textarea
                  value={editingAlert.message}
                  onChange={e => setEditingAlert({ ...editingAlert, message: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background p-3 text-sm focus:ring-1 focus:ring-primary focus:outline-none min-h-[100px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Severity Level</label>
                <select
                  value={editingAlert.severity}
                  onChange={e => setEditingAlert({ ...editingAlert, severity: e.target.value as RiskLevel })}
                  className="w-full rounded-lg border border-input bg-background p-2.5 text-sm focus:outline-none"
                >
                  <option value="high">High Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="low">Low Risk</option>
                </select>
              </div>
              <button
                onClick={handleEditSave}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Broadcast Updates
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Intelligence Report</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Deployment</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Class</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Timestamp</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground text-center">Operations</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 text-foreground font-medium max-w-xs">{a.message}</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-[10px]">{a.region}</td>
                  <td className="px-6 py-4"><RiskBadge level={a.severity} /></td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter",
                      a.status === 'active' ? 'bg-red-500/10 text-red-500' :
                        a.status === 'investigating' ? 'bg-orange-500/10 text-orange-500' :
                          a.status === 'pending_confirmation' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 animate-pulse' :
                            'bg-emerald-500/10 text-emerald-500'
                    )}>
                      {a.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-[10px]">{a.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditingAlert(a)}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit Intelligence"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      {a.status === 'pending_confirmation' ? (
                        <>
                          <button
                            onClick={() => handleStatusChange(a.id, 'resolved')}
                            className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-[10px] font-black uppercase text-white hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30 ring-1 ring-blue-400"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Confirm Resolve
                          </button>
                          <button
                            onClick={() => handleStatusChange(a.id, 'active')}
                            className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-[10px] font-black uppercase text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20"
                          >
                            <RefreshCw className="h-3.5 w-3.5" /> Reject
                          </button>
                        </>
                      ) : a.status !== 'resolved' ? (
                        <button
                          onClick={() => handleStatusChange(a.id, 'resolved')}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase text-emerald-500 hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Force Resolve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(a.id, 'active')}
                          className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-[10px] font-black uppercase text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20"
                        >
                          <RefreshCw className="h-3.5 w-3.5" /> Reopen
                        </button>
                      )}
                    </div>
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

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default AlertManagement;
