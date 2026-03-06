import MapView from '@/components/MapView';
import RiskBadge from '@/components/RiskBadge';
import { useAuth } from '@/contexts/AuthContext';

type RiskLevel = 'high' | 'medium' | 'low';

const REGIONS = [
  { id: 'r1', name: 'Western Ghats', riskLevel: 'high' as RiskLevel, activeDetections: 12, assignedOfficer: 'Priya Sharma' },
  { id: 'r2', name: 'Sundarbans', riskLevel: 'medium' as RiskLevel, activeDetections: 7, assignedOfficer: 'Ravi Kumar' },
  { id: 'r3', name: 'Aravalli Hills', riskLevel: 'low' as RiskLevel, activeDetections: 3, assignedOfficer: 'Dev Anand' },
];

const AssignedRegion = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Assigned Region</h1>
        <p className="text-muted-foreground">{user?.region ?? 'Your region'} monitoring overview</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <MapView className="h-[500px]" filterRegion={user?.region} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REGIONS.slice(0, 3).map(r => (
          <div key={r.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-card-foreground">{r.name}</h4>
              <RiskBadge level={r.riskLevel} />
            </div>
            <p className="text-sm text-muted-foreground">Officer: {r.assignedOfficer}</p>
            <p className="text-sm text-muted-foreground">Active Detections: {r.activeDetections}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignedRegion;
