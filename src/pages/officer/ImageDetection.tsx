import { Upload } from 'lucide-react';
import { useState } from 'react';
import DetectionSimulator from '@/components/DetectionSimulator';

const ImageDetection = () => {
  const [dragOver, setDragOver] = useState(false);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Image & Detection</h1>
        <p className="text-muted-foreground">Upload imagery and run AI analysis</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Upload Satellite Image</h3>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); }}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <Upload className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-card-foreground font-medium">Drag & drop image</p>
            <p className="text-xs text-muted-foreground mt-1">GeoTIFF, PNG, JPG</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Run Detection</h3>
          <DetectionSimulator />
        </div>
      </div>
    </div>
  );
};

export default ImageDetection;
