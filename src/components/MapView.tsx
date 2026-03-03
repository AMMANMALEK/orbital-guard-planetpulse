import { cn } from '@/lib/utils';

interface MapPoint {
  id: string;
  position: [number, number];
  label: string;
  riskLevel: 'high' | 'medium' | 'low';
}

const MapView = ({ points = [], className }: { points?: MapPoint[]; className?: string }) => {
  const colors = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };

  return (
    <div className={cn('relative rounded-xl border border-border bg-card overflow-hidden', className)}
      style={{ minHeight: 300 }}>
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'linear-gradient(hsl(160 84% 39% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(160 84% 39% / 0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Detection points */}
      {points.map(point => (
        <div key={point.id} className="absolute group cursor-pointer"
          style={{ left: `${point.position[0]}%`, top: `${point.position[1]}%`, transform: 'translate(-50%, -50%)' }}>
          <div className="h-3 w-3 rounded-full animate-pulse"
            style={{ backgroundColor: colors[point.riskLevel], boxShadow: `0 0 12px ${colors[point.riskLevel]}` }} />
          <div className="absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-card/95 backdrop-blur px-2 py-1 text-xs text-card-foreground opacity-0 group-hover:opacity-100 transition-opacity border border-border z-10">
            {point.label}
          </div>
        </div>
      ))}

      {/* Corner brackets */}
      <div className="absolute top-2 left-2 h-4 w-4 border-l-2 border-t-2 border-primary/40" />
      <div className="absolute top-2 right-2 h-4 w-4 border-r-2 border-t-2 border-primary/40" />
      <div className="absolute bottom-2 left-2 h-4 w-4 border-l-2 border-b-2 border-primary/40" />
      <div className="absolute bottom-2 right-2 h-4 w-4 border-r-2 border-b-2 border-primary/40" />

      <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs font-mono text-primary/70">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        LIVE MONITORING
      </div>
      <div className="absolute top-3 right-3 text-xs font-mono text-muted-foreground">
        SENTINEL-2 FEED
      </div>
    </div>
  );
};

export default MapView;
