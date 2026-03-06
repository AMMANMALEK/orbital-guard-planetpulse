import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Paperclip, Clock, User } from 'lucide-react';
import type { Complaint } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface InvestigationPanelProps {
  complaint: Complaint;
  onUpdateStatus: (id: string, status: Complaint['status']) => void;
  onAddNote: (id: string, note: string) => void;
  onAddAttachment?: (id: string, file: File) => void;
}

export default function InvestigationPanel({
  complaint,
  onUpdateStatus,
  onAddNote,
}: InvestigationPanelProps) {
  const [note, setNote] = useState('');
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);

  const handleAddNote = () => {
    if (!note.trim()) return;
    onAddNote(complaint.id, note.trim());
    setNote('');
  };

  const timeline = complaint.resolutionTimeline || [];
  if (complaint.officerNotes) {
    const existing = timeline.some(t => t.note === complaint.officerNotes);
    if (!existing) {
      timeline.unshift({
        date: complaint.submittedAt,
        note: complaint.officerNotes,
      });
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Investigation Notes</CardTitle>
          <p className="text-sm text-muted-foreground">Add notes and update status</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={complaint.status} onValueChange={(v) => onUpdateStatus(complaint.id, v as Complaint['status'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Add Note</label>
            <div className="flex gap-2">
              <Textarea
                placeholder="Enter investigation notes..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
              <Button onClick={handleAddNote} size="sm" className="shrink-0">Add</Button>
            </div>
          </div>
          <div>
            <Button variant="outline" size="sm">
              <Paperclip className="h-4 w-4 mr-2" />
              Attach Image
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Status Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeline.length === 0 && complaint.officerNotes && (
              <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm text-foreground">{complaint.officerNotes}</p>
                  <p className="text-xs text-muted-foreground">{complaint.submittedAt}</p>
                </div>
              </div>
            )}
            {timeline.map((t, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm text-foreground">{t.note}</p>
                  <p className="text-xs text-muted-foreground">{t.date}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-muted mt-1.5 shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Submitted by {complaint.submittedBy}</p>
                <p className="text-xs text-muted-foreground">{complaint.submittedAt}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
