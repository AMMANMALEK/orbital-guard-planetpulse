import { Scan, MapPin, Calendar } from 'lucide-react';
import RiskBadge from '@/components/RiskBadge';
import RiskScoreBar from '@/components/RiskScoreBar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/data/mockData';

interface DetectionResultCardProps {
  id: string;
  location: string;
  type: string;
  riskScore: number;
  confidenceScore: number;
  riskLevel: RiskLevel;
  status: string;
  date: string;
  imagePreview?: string;
  className?: string;
}

const typeLabels: Record<string, string> = {
  'illegal-mining': 'Illegal Mining',
  deforestation: 'Deforestation',
  'river-encroachment': 'River Encroachment',
};

export default function DetectionResultCard({
  id,
  location,
  type,
  riskScore,
  confidenceScore,
  riskLevel,
  status,
  date,
  imagePreview,
  className,
}: DetectionResultCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      {imagePreview && (
        <div className="h-32 bg-muted relative overflow-hidden">
          <img src={imagePreview} alt={location} className="w-full h-full object-cover" />
          <div className="absolute top-2 right-2">
            <RiskBadge level={riskLevel} />
          </div>
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan className="h-4 w-4 text-primary" />
            <span className="text-xs font-mono text-muted-foreground">#{id}</span>
          </div>
          {!imagePreview && <RiskBadge level={riskLevel} />}
        </div>
        <h4 className="font-semibold text-foreground">{location}</h4>
        <p className="text-sm text-muted-foreground">{typeLabels[type] || type}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <RiskScoreBar score={riskScore} confidence={confidenceScore} />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {location}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" /> {date}
          </span>
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            status === 'detected' && 'bg-destructive/20 text-destructive',
            status === 'investigating' && 'bg-risk-medium/20 text-risk-medium',
            status === 'resolved' && 'bg-risk-low/20 text-risk-low'
          )}>
            {status}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
