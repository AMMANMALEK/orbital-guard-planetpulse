import { useState, useEffect } from 'react';
import { FileText, Eye, AlertCircle, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PublicReports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/complaints');
        const confirmed = res.data.filter((c: any) => c.status === 'confirmed');
        setReports(confirmed);
      } catch (err) {
        console.error('Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Verification Reports</h1>
        <p className="text-muted-foreground">Transparency portal for AI-verified environmental violations</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12 text-muted-foreground animate-pulse">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="text-center p-12 border rounded-xl bg-muted/20">
           <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
           <p className="text-muted-foreground">No confirmed violation reports available yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="overflow-hidden border-primary/20 bg-card/50 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row">
                {/* Images Section */}
                <div className="grid grid-cols-2 gap-1 p-1 md:w-1/3 h-48 md:h-auto border-b md:border-b-0 md:border-r">
                   <div className="relative group overflow-hidden bg-muted">
                      {report.complaint_images && report.complaint_images.length > 0 ? (
                        <img src={report.complaint_images[0]} alt="Ground" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground text-[10px]">No Ground Image</div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-[10px] text-white font-bold uppercase">
                        Ground Evidence {report.complaint_images?.length > 1 && `(+${report.complaint_images.length - 1})`}
                      </div>
                   </div>
                   <div className="relative group overflow-hidden">
                      <img src={report.satellite_image_url} alt="Satellite" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-[10px] text-white font-bold uppercase">Satellite Verification</div>
                   </div>
                </div>

                {/* Content Section */}
                <div className="p-6 md:w-2/3 flex flex-col">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                           <Badge variant="outline" className="text-primary border-primary/30 uppercase text-[10px]">{report.violation_type.replace('_', ' ')}</Badge>
                           <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-bold text-card-foreground line-clamp-1">{report.location_name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Verified on {report.submittedAt}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Risk Score</p>
                         <div className={`text-2xl font-black ${report.ai_risk_score > 70 ? 'text-destructive' : 'text-primary'}`}>
                            {report.ai_risk_score}%
                         </div>
                      </div>
                   </div>

                   <p className="text-sm text-muted-foreground line-clamp-2 mb-6 italic">
                      "{report.description}"
                   </p>

                   <div className="mt-auto flex items-center justify-between border-t pt-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                         <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                         AI Result: <span className="font-bold text-card-foreground capitalize">{report.ai_violation_type?.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">Conf: {(report.ai_confidence * 100).toFixed(1)}%</span>
                        <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">CONFIRMED</Badge>
                      </div>
                   </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicReports;
