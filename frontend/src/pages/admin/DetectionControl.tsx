import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import RiskBadge from '@/components/RiskBadge';
import { toast } from 'sonner';
import api from '@/lib/api';

type RiskLevel = 'high' | 'medium' | 'low';

interface Detection {
  id: string;
  location: string;
  prediction: string;
  risk_score: number;
  confidence: number;
  status: string;
  timestamp: string;
  region: string;
  image_url?: string;
}

interface DetectionResult {
  prediction: string;
  confidence: number;
  risk_score: number;
}

const DetectionControl = () => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDetections = async () => {
    try {
      const res = await api.get('/detections');
      setDetections(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load detections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetections(); }, []);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    toast.success(`Image "${file.name}" ready for analysis.`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleRunDetection = async () => {
    if (!selectedFile) { toast.error('Please select an image first.'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('location', 'Unknown Location');
      formData.append('region', 'Unknown');
      formData.append('lat', '20.0');
      formData.append('lng', '78.0');
      const res = await api.post('/detections/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
      toast.success('Detection complete!');
      fetchDetections(); // Refresh list
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Detection failed');
    } finally {
      setUploading(false);
    }
  };

  const riskFromScore = (score: number): RiskLevel =>
    score >= 80 ? 'high' : score >= 65 ? 'medium' : 'low';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Detection Control</h1>
        <p className="text-muted-foreground">Upload satellite imagery and run AI detection</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-card-foreground">Upload Satellite Image</h3>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".tiff,.geotiff,.png,.jpg,.jpeg" />
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-all ${dragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border'}`}>
            {selectedFile ? (
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-card-foreground">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for analysis</p>
                <button onClick={() => fileInputRef.current?.click()} className="mt-4 text-xs font-medium text-primary hover:underline">Replace image</button>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-card-foreground font-medium">Drag & drop satellite image here</p>
                <p className="text-xs text-muted-foreground mt-1">Supports GeoTIFF, PNG, JPG (Sentinel-2 format)</p>
                <button onClick={() => fileInputRef.current?.click()} className="mt-4 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors">Browse Files</button>
              </>
            )}
          </div>
          {selectedFile && (
            <button
              onClick={handleRunDetection}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-60"
            >
              {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : 'Run AI Detection'}
            </button>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-card-foreground">AI Detection Result</h3>
          {result ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                <span className="text-sm text-muted-foreground font-medium">Prediction</span>
                <span className="text-sm font-bold text-foreground capitalize">{(result.prediction ?? '').replace(/-/g, ' ')}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                <span className="text-sm text-muted-foreground font-medium">Confidence</span>
                <span className="text-sm font-bold text-foreground">{result.confidence != null ? (result.confidence * 100).toFixed(1) : '—'}%</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                <span className="text-sm text-muted-foreground font-medium">Risk Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{result.risk_score ?? '—'}/100</span>
                  <RiskBadge level={riskFromScore(result.risk_score)} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Upload an image and run detection to see AI results</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-card-foreground">Detection History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Location</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Type</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Risk</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Confidence</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Status</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Loading detections...</td></tr>
              ) : detections.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No detections yet. Upload an image to start.</td></tr>
              ) : detections.map(d => (
                <tr key={d.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-card-foreground">{d.location ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{(d.prediction ?? '').replace(/-/g, ' ') || '—'}</td>
                  <td className="px-4 py-3"><RiskBadge level={riskFromScore(d.risk_score ?? 0)} /></td>
                  <td className="px-4 py-3 text-card-foreground font-mono">{d.confidence != null ? (d.confidence * 100).toFixed(0) : '—'}%</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${d.status === 'detected' ? 'bg-destructive/20 text-destructive' : d.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-emerald-500/20 text-emerald-500'}`}>{d.status ?? '—'}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{d.timestamp?.split('T')[0] ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DetectionControl;
