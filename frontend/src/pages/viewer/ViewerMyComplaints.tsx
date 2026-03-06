import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'rejected';
  submittedBy: string;
  submittedAt: string;
  officerNotes?: string;
}

export default function ViewerMyComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/complaints?mine=true');
        setComplaints(res.data);
      } catch {
        toast.error('Failed to load your complaints');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  // Client-side filter for extra safety
  const myComplaints = user?.email
    ? complaints.filter(c => c.submittedBy === user.email)
    : complaints;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Complaints</h1>
        <p className="text-muted-foreground">Track your submitted complaints and resolution status</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Complaint Status
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading...' : `${myComplaints.length} complaint(s) submitted`}
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading complaints...</p>
          ) : myComplaints.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No complaints submitted yet</p>
          ) : (
            <div className="space-y-4">
              {myComplaints.map(c => (
                <div
                  key={c.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border"
                >
                  <div>
                    <h4 className="font-medium">{c.title}</h4>
                    <p className="text-sm text-muted-foreground truncate max-w-md">{c.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">Submitted {c.submittedAt}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      c.status === 'resolved' ? 'border-green-500/50 text-green-600' :
                      c.status === 'rejected' ? 'border-red-500/50 text-red-600' :
                      c.status === 'investigating' ? 'border-blue-500/50 text-blue-600' :
                      'border-yellow-500/50 text-yellow-600'
                    }
                  >
                    {c.status}
                  </Badge>
                  {c.officerNotes && (
                    <div className="text-sm text-muted-foreground border-l-2 pl-3">
                      <strong>Officer note:</strong> {c.officerNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
