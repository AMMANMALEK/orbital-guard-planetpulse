import MapView from '@/components/MapView';
import { regions } from '@/data/mockData';
import RiskBadge from '@/components/RiskBadge';

const AssignedRegion = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Assigned Region</h1>
      <p className="text-muted-foreground">Western Ghats monitoring overview</p>
    </div>
    <div className="rounded-xl border border-border bg-card p-6">
      <MapView className="h-[500px]" filterRegion="Western Ghats" />
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {regions.slice(0, 3).map(r => (
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

export default AssignedRegion;
