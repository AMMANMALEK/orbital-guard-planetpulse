import { useState, useEffect, useRef } from 'react';
import { Upload, CheckCircle2, Loader2, FileText } from 'lucide-react';
import DetectionResultCard from '@/components/DetectionResultCard';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Detection {
  id: string;
  location: string;
  prediction: string;
  risk_score: number;
  confidence: number;
  status: string;
  timestamp: string;
  region: string;
}

const ImageDetection = () => {
  const { user } = useAuth();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDetections = async () => {
    try {
      const res = await api.get('/detections?limit=4');
      setDetections(res.data);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchDetections(); }, []);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    toast.success(`Image "${file.name}" uploaded successfully.`);
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
      formData.append('location', user?.assigned_region?.name || 'Field Location');
      formData.append('region', user?.assigned_region?.name || 'Unknown');
      formData.append('lat', String(user?.assigned_region?.latitude || 20.0));
      formData.append('lng', String(user?.assigned_region?.longitude || 78.0));
      const res = await api.post('/detections/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
      toast.success('AI detection complete!');
      fetchDetections();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Detection failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Image & Detection</h1>
        <p className="text-muted-foreground">Upload imagery and run AI analysis</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Upload Satellite Image</h3>
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
                <p className="text-sm text-card-foreground font-medium text-center">Drag & drop image here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">GeoTIFF, PNG, JPG</p>
                <button onClick={() => fileInputRef.current?.click()} className="mt-4 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors">Browse Files</button>
              </>
            )}
          </div>
          {selectedFile && (
            <button
              onClick={handleRunDetection}
              disabled={uploading}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-60"
            >
              {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : 'Run Detection'}
            </button>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Detection Result</h3>
          {result ? (
            <div className="space-y-3">
              <div className="flex justify-between p-3 rounded-lg bg-muted/30 border border-border">
                <span className="text-sm text-muted-foreground">Prediction</span>
                <span className="text-sm font-bold capitalize">{result.prediction?.replace(/-/g, ' ')}</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-muted/30 border border-border">
                <span className="text-sm text-muted-foreground">Confidence</span>
                <span className="text-sm font-bold">{(result.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-muted/30 border border-border">
                <span className="text-sm text-muted-foreground">Risk Score</span>
                <span className="text-sm font-bold">{result.risk_score}/100</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Upload and run detection to see AI results here</p>
            </div>
          )}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Recent Detections</h3>
        {detections.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">No detections yet. Upload an image to start.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {detections.slice(0, 4).map(d => (
              <DetectionResultCard
                key={d.id}
                id={d.id}
                location={d.location}
                type={d.prediction as any}
                riskScore={d.risk_score}
                confidenceScore={Math.round(d.confidence * 100)}
                riskLevel={d.risk_score >= 80 ? 'high' : d.risk_score >= 50 ? 'medium' : 'low'}
                status={d.status as any}
                date={d.timestamp?.split('T')[0]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageDetection;
