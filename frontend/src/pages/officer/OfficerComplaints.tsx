import { useState, useEffect } from 'react';
import ComplaintTable from '@/components/ComplaintTable';
import InvestigationPanel from '@/components/InvestigationPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileWarning } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

type ComplaintStatus = 'pending' | 'investigating' | 'resolved' | 'rejected';

interface Complaint {
  id: string;
  title: string;
  description: string;
  violation_type: string;
  location_coordinates: [number, number];
  evidence_image?: string;
  status: ComplaintStatus;
  submittedBy: string;
  submittedAt: string;
  region?: string;
  assignedOfficer?: string;
  officerNotes?: string;
  resolutionTimeline?: { date: string; note: string }[];
  convertedToAlertId?: string;
}

export default function OfficerComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selected, setSelected] = useState<Complaint | null>(null);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } catch {
      toast.error('Failed to load complaints');
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.patch(`/complaints/${id}`, { status });
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: status as ComplaintStatus } : c));
      toast.success('Status updated');
    } catch { toast.error('Failed to update status'); }
  };

  const handleAddNote = async (id: string, note: string) => {
    try {
      await api.patch(`/complaints/${id}`, { officerNotes: note });
      setComplaints(prev => prev.map(c =>
        c.id === id ? { ...c, officerNotes: note } : c
      ));
      if (selected?.id === id) setSelected(s => s ? { ...s, officerNotes: note } : s);
      toast.success('Note saved');
    } catch { toast.error('Failed to save note'); }
  };

  const handleConvertToAlert = async (id: string) => {
    try {
      await api.patch(`/complaints/${id}`, { status: 'resolved' });
      setComplaints(prev => prev.map(x => x.id === id ? { ...x, status: 'resolved' as ComplaintStatus } : x));
      setSelected(null);
      toast.success('Complaint resolved and escalated');
    } catch { toast.error('Failed to escalate complaint'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Complaint Verification</h1>
        <p className="text-muted-foreground">View complaints in your region, verify location, convert to alert</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileWarning className="h-5 w-5" />
            Regional Complaints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ComplaintTable
            complaints={complaints}
            onStatusChange={handleStatusChange}
            onConvertToAlert={handleConvertToAlert}
            showActions
          />
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Click a complaint to open investigation panel</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {complaints.map(c => (
                <Button
                  key={c.id}
                  variant={selected?.id === c.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelected(selected?.id === c.id ? null : c)}
                >
                  {c.title}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      {selected && (
        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selected.title}</DialogTitle>
            </DialogHeader>
            <InvestigationPanel
              complaint={selected}
              onUpdateStatus={(id, status) => {
                handleStatusChange(id, status);
                setSelected(s => s ? { ...s, status: status as ComplaintStatus } : s);
              }}
              onAddNote={handleAddNote}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
