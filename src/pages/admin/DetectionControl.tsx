import { useState } from 'react';
import { Upload } from 'lucide-react';
import DetectionSimulator from '@/components/DetectionSimulator';
import RiskBadge from '@/components/RiskBadge';
import { detections } from '@/data/mockData';
import type { RiskLevel } from '@/data/mockData';

const DetectionControl = () => {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Detection Control</h1>
        <p className="text-muted-foreground">Upload satellite imagery and run AI detection</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-card-foreground">Upload Satellite Image</h3>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); }}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <Upload className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-card-foreground font-medium">Drag & drop satellite image here</p>
            <p className="text-xs text-muted-foreground mt-1">Supports GeoTIFF, PNG, JPG (Sentinel-2 format)</p>
            <button className="mt-4 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">Browse Files</button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-card-foreground">AI Detection</h3>
          <DetectionSimulator />
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
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {detections.map(d => (
                <tr key={d.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-card-foreground">{d.location}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{d.type.replace('-', ' ')}</td>
                  <td className="px-4 py-3"><RiskBadge level={(d.riskScore >= 80 ? 'high' : d.riskScore >= 65 ? 'medium' : 'low') as RiskLevel} /></td>
                  <td className="px-4 py-3 text-card-foreground font-mono">{d.confidenceScore}%</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${d.status === 'detected' ? 'bg-destructive/20 text-destructive' : d.status === 'investigating' ? 'bg-risk-medium/20 text-risk-medium' : 'bg-risk-low/20 text-risk-low'}`}>{d.status}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{d.date}</td>
                  <td className="px-4 py-3">
                    <button className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20">Re-run</button>
                  </td>
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
