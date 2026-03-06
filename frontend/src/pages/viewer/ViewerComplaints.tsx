import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ComplaintForm from '@/components/ComplaintForm';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import api, { getErrorMessage } from '@/lib/api';

export default function ViewerComplaints() {
  const { user } = useAuth();

  const handleSubmit = async (data: any) => {
    try {
      await api.post('/complaints', {
        ...data,
        submittedBy: user?.email || 'anonymous@viewer.com',
      });
      toast.success('Complaint submitted successfully');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to submit complaint'));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Report a Violation</h1>
        <p className="text-muted-foreground">Submit a citizen complaint with evidence</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            New Complaint
          </CardTitle>
          <CardDescription>Provide details and location to help our team investigate</CardDescription>
        </CardHeader>
        <CardContent>
          <ComplaintForm
            onSubmit={handleSubmit}
            submittedBy={user?.email || 'anonymous@viewer.com'}
          />
        </CardContent>
      </Card>
    </div>
  );
}
