import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Camera, Brain, CheckCircle, XCircle, ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

const OfficerInvestigation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const res = await api.get('/complaints');
      const found = res.data.find((c: any) => c.id === id);
      if (found) {
        setComplaint(found);
        setNotes(found.officerNotes || '');
        if (found.status === 'pending') {
          await api.patch(`/complaints/${id}/investigate`);
        }
      }
    } catch (err) {
      toast.error('Failed to load complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = async () => {
    setCapturing(true);
    try {
      const res = await api.post(`/complaints/${id}/capture`);
      setComplaint({ ...complaint, ...res.data, satellite_image_url: res.data.image_url, ai_prediction: res.data.prediction, ai_confidence: res.data.confidence, ai_risk_score: res.data.risk_score });
      toast.success('Satellite image captured and analyzed');
    } catch (err) {
      toast.error('Failed to capture satellite image');
    } finally {
      setCapturing(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    setSubmitting(true);
    try {
      await api.patch(`/complaints/${id}/status`, {
        status,
        officerNotes: notes
      });
      toast.success(`Complaint ${status} successfully`);
      navigate('/officer/complaints');
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!complaint) return <div>Complaint not found</div>;

  const position: [number, number] = [complaint.latitude, complaint.longitude];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Investigation</h1>
          <p className="text-muted-foreground">Complaint ID: {id}</p>
        </div>
        <div className="ml-auto">
           <Badge variant={complaint.status === 'confirmed' ? 'destructive' : 'secondary'}>
             {complaint.status.toUpperCase()}
           </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Complaint & Satellite Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Complaint Details</CardTitle>
              <CardDescription>Submitted by {complaint.submittedBy} on {complaint.submittedAt}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground">Violation Type</p>
                <p className="text-lg font-semibold">{complaint.violation_type.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground">Location</p>
                <p className="text-sm">{complaint.location_name}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground">Description</p>
                <p className="text-sm text-muted-foreground italic">"{complaint.description}"</p>
              </div>
              {complaint.complaint_images && complaint.complaint_images.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Ground Evidence ({complaint.complaint_images.length})</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {complaint.complaint_images.map((img: string, i: number) => (
                      <img 
                        key={i} 
                        src={img} 
                        alt={`Evidence ${i}`} 
                        className="w-48 h-32 object-cover rounded-lg border flex-shrink-0 hover:border-primary transition-colors cursor-zoom-in" 
                        onClick={() => window.open(img, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!complaint.ai_prediction ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No satellite data analyzed yet.</p>
                  <Button onClick={handleCapture} disabled={capturing} className="w-full">
                    {capturing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                    Capture Satellite Image & Run AI
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-background p-3 rounded-lg border">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">AI Prediction</p>
                        <p className="text-lg font-bold text-primary">{complaint.ai_prediction.replace('-', ' ')}</p>
                     </div>
                     <div className="bg-background p-3 rounded-lg border">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Confidence</p>
                        <p className="text-lg font-bold">{(complaint.ai_confidence * 100).toFixed(1)}%</p>
                     </div>
                  </div>
                  <div className="bg-background p-3 rounded-lg border">
                     <div className="flex justify-between mb-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Risk Score</p>
                        <p className="text-xs font-bold">{complaint.ai_risk_score}/100</p>
                     </div>
                     <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${complaint.ai_risk_score > 70 ? 'bg-destructive' : complaint.ai_risk_score > 40 ? 'bg-warning' : 'bg-success'}`} 
                          style={{ width: `${complaint.ai_risk_score}%` }}
                        />
                     </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Satellite Verification Image</p>
                    <img src={complaint.satellite_image_url} alt="Satellite View" className="w-full h-64 object-cover rounded-lg border" />
                  </div>
                  <Button variant="outline" size="sm" onClick={handleCapture} disabled={capturing} className="w-full">
                    {capturing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                    Recapture Image
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Map & Action */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Geospatial Context
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="h-[400px]">
                  <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                    />
                    <Marker position={position}>
                      <Popup>
                        Complaint Location: {complaint.location_name}
                      </Popup>
                    </Marker>
                    <ChangeView center={position} />
                  </MapContainer>
               </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Decision Terminal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <FormLabel>Officer Observations</FormLabel>
                <Textarea 
                  placeholder="Add your comments based on visual and AI verification..." 
                  className="mt-2 min-h-[120px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={submitting}
                >
                  <XCircle className="mr-2 h-4 w-4" /> Reject
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => handleStatusUpdate('confirmed')}
                  disabled={submitting}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Confirm
                </Button>
              </div>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => handleStatusUpdate('resolved')}
                disabled={submitting}
              >
                Mark as Resolved
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const FormLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
    {children}
  </label>
);

export default OfficerInvestigation;
