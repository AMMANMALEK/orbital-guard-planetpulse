import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import RiskBadge from '@/components/RiskBadge';
import { MessageSquare, ShieldAlert, Clock, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';
import type { Alert } from '@/data/mockData';

const OfficerAlerts = () => {
  const { alerts, updateAlert } = useAppContext();
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [note, setNote] = useState<string>('');

  // In a real app, we'd filter by the logged-in officer's region
  const regionAlerts = alerts.filter(a => a.region === 'Western Ghats' || a.region === 'Sundarbans');

  const handleStatusChange = (id: string, status: Alert['status']) => {
    updateAlert(id, { status });
    toast.success(`Operational status updated to ${status}`);
  };

  const handleSaveNote = (id: string) => {
    if (!note.trim()) return;
    updateAlert(id, { notes: note });
    toast.success("Field intelligence logged");
    setSelectedAlert(null);
    setNote('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Operational Intelligence</h1>
          <p className="text-muted-foreground">Regional surveillance alerts & field reports</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 animate-pulse">
          <ShieldAlert className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="grid gap-4">
        {regionAlerts.length > 0 ? regionAlerts.map(a => (
          <div key={a.id} className="group relative rounded-2xl border border-border bg-card p-5 space-y-4 hover:border-primary/40 transition-all shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
                  INCIDENT #{a.id.toUpperCase()}
                </div>
                <p className="text-lg font-bold text-card-foreground leading-tight">{a.message}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1.5 font-medium"><MapPin className="h-3.5 w-3.5" /> {a.region}</span>
                  <span className="flex items-center gap-1.5 font-medium"><Clock className="h-3.5 w-3.5" /> {a.date}</span>
                </div>
              </div>
              <RiskBadge level={a.severity} />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/50">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Mission Status</label>
                <select
                  value={a.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as Alert['status'];
                    // If officer tries to resolve, it goes to pending_confirmation
                    const finalStatus = newStatus === 'resolved' ? 'pending_confirmation' : newStatus;
                    handleStatusChange(a.id, finalStatus);
                  }}
                  className="rounded-lg border border-input bg-muted/30 px-3 py-1.5 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  disabled={a.status === 'pending_confirmation'}
                >
                  <option value="active">Active Alert</option>
                  <option value="investigating">Operational Investigation</option>
                  <option value="resolved">Submit for Resolution</option>
                  {a.status === 'pending_confirmation' && (
                    <option value="pending_confirmation">Pending HQ Approval</option>
                  )}
                </select>
              </div>

              {a.status === 'pending_confirmation' && (
                <div className="flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 border border-blue-500/20 animate-pulse">
                  <Clock className="h-3 w-3 text-blue-500" />
                  <span className="text-[9px] font-black uppercase text-blue-500 tracking-tighter">Awaiting Confirmation</span>
                </div>
              )}

              <div className="flex-grow flex justify-end items-end h-full">
                <button
                  onClick={() => {
                    setSelectedAlert(selectedAlert === a.id ? null : a.id);
                    setNote(a.notes || '');
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-tighter transition-all",
                    selectedAlert === a.id ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  <MessageSquare className="h-4 w-4" />
                  {selectedAlert === a.id ? 'Discard Intelligence' : a.notes ? 'Review Intelligence' : 'Log Intelligence'}
                </button>
              </div>
            </div>

            {selectedAlert === a.id && (
              <div className="pt-2 animate-in slide-in-from-top-2 duration-200">
                <div className="relative">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Enter field observations, geospatial evidence, or mission updates..."
                    rows={4}
                    className="w-full rounded-xl border border-input bg-muted/20 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                  <button
                    onClick={() => handleSaveNote(a.id)}
                    className="absolute bottom-3 right-3 flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-[10px] font-black text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
                  >
                    <Send className="h-3 w-3" /> TRANSMIT DATA
                  </button>
                </div>
              </div>
            )}

            {a.notes && !selectedAlert && (
              <div className="mt-2 text-xs italic text-muted-foreground bg-muted/20 p-2 rounded-lg border border-border/30">
                <span className="font-black uppercase text-[9px] mr-2 not-italic text-primary">Last Intelligence Log:</span>
                "{a.notes}"
              </div>
            )}
          </div>
        )) : (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
            <ShieldAlert className="h-12 w-12 text-muted/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No tactical alerts in your current sector.</p>
          </div>
        )}
      </div>
    </div>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default OfficerAlerts;
