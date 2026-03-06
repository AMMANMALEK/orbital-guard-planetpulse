import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import RiskBadge from '@/components/RiskBadge';
import { Badge } from '@/components/ui/badge';
import type { ComplaintStatus } from '@/data/mockData';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Complaint {
  id: string;
  title: string;
  description: string;
  violation_type: string;
  status: ComplaintStatus;
  region?: string;
  assignedOfficer?: string;
  submittedAt: string;
}

interface MockUser {
  id: string;
  name: string;
  role: string;
}


const statusColors: Record<ComplaintStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-600',
  investigating: 'bg-blue-500/20 text-blue-600',
  resolved: 'bg-green-500/20 text-green-600',
  rejected: 'bg-red-500/20 text-red-600',
};

const violationLabels: Record<string, string> = {
  illegal_mining: 'Illegal Mining',
  deforestation: 'Deforestation',
  'river-encroachment': 'River Encroachment',
  pollution: 'Pollution',
  other: 'Other',
};

interface ComplaintTableProps {
  complaints: Complaint[];
  officers?: MockUser[];
  onStatusChange?: (id: string, status: ComplaintStatus) => void;
  onAssignOfficer?: (id: string, officerId: string) => void;
  onConvertToAlert?: (id: string) => void;
  showActions?: boolean;
}

export default function ComplaintTable({
  complaints,
  officers = [],
  onStatusChange,
  onAssignOfficer,
  onConvertToAlert,
  showActions = true,
}: ComplaintTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Region</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assigned</TableHead>
          <TableHead>Submitted</TableHead>
          {showActions && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {complaints.map(c => (
          <TableRow key={c.id}>
            <TableCell>
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{c.description}</p>
              </div>
            </TableCell>
            <TableCell>{violationLabels[c.violation_type] || c.violation_type}</TableCell>
            <TableCell>{c.region || '—'}</TableCell>
            <TableCell>
              <Badge className={cn('capitalize', statusColors[c.status])}>{c.status}</Badge>
            </TableCell>
            <TableCell>{c.assignedOfficer || '—'}</TableCell>
            <TableCell className="text-muted-foreground">{c.submittedAt}</TableCell>
            {showActions && (
              <TableCell className="text-right space-x-2">
                {onStatusChange && (
                  <Select value={c.status} onValueChange={(v) => onStatusChange(c.id, v as ComplaintStatus)}>
                    <SelectTrigger className="w-[130px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                {onAssignOfficer && officers.length > 0 && (
                  <Select
                    value={c.assignedOfficer || ''}
                    onValueChange={(v) => onAssignOfficer(c.id, v)}
                  >
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue placeholder="Assign" />
                    </SelectTrigger>
                    <SelectContent>
                      {officers.filter(o => o.role === 'officer').map(o => (
                        <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {onConvertToAlert && c.status === 'investigating' && (
                  <Button size="sm" variant="outline" onClick={() => onConvertToAlert(c.id)}>
                    Convert to Alert
                  </Button>
                )}
                <Button size="sm" variant="outline" asChild>
                  <a href={`/officer/investigate/${c.id}`}>Investigate</a>
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
