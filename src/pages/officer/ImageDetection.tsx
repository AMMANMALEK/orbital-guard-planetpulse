import { useState, useRef } from 'react';
import { Upload, CheckCircle2 } from 'lucide-react';
import DetectionSimulator from '@/components/DetectionSimulator';
import { useToast } from '@/hooks/use-toast';

const ImageDetection = () => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      toast({
        title: "Success",
        description: `Satellite image "${file.name}" uploaded successfully.`,
      });
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      toast({
        title: "Success",
        description: `Satellite image "${file.name}" uploaded successfully via drag & drop.`,
      });
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
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".tiff,.geotiff,.png,.jpg,.jpeg"
          />
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
                <button
                  onClick={handleBrowseClick}
                  className="mt-4 text-xs font-medium text-primary hover:underline"
                >
                  Replace image
                </button>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-card-foreground font-medium text-center">Drag & drop image here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">GeoTIFF, PNG, JPG</p>
                <button
                  onClick={handleBrowseClick}
                  className="mt-4 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  Browse Files
                </button>
              </>
            )}
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

