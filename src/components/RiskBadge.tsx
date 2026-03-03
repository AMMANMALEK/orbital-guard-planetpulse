import { cn } from '@/lib/utils';

const RiskBadge = ({ level, className }: { level: 'high' | 'medium' | 'low'; className?: string }) => {
  const styles = {
    high: 'bg-risk-high/20 text-risk-high border-risk-high/30',
    medium: 'bg-risk-medium/20 text-risk-medium border-risk-medium/30',
    low: 'bg-risk-low/20 text-risk-low border-risk-low/30',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', styles[level], className)}>
      {level.charAt(0).toUpperCase() + level.slice(1)} Risk
    </span>
  );
};

export default RiskBadge;
