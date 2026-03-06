import { cn } from '@/lib/utils';

interface RiskScoreBarProps {
  score: number;
  confidence?: number;
  className?: string;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'bg-risk-high';
  if (score >= 50) return 'bg-risk-medium';
  return 'bg-risk-low';
};

export default function RiskScoreBar({ score, confidence, className }: RiskScoreBarProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">Risk Score</span>
        <span className="font-semibold text-foreground">{score}/100</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-500 rounded-full', getScoreColor(score))}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
      {confidence !== undefined && (
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>AI Confidence</span>
          <span>{confidence}%</span>
        </div>
      )}
    </div>
  );
}
