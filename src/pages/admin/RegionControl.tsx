import { regions } from '@/data/mockData';
import MapView from '@/components/MapView';
import RiskBadge from '@/components/RiskBadge';

const RegionControl = () => {
  const mapPoints = regions.map(r => ({
    id: r.id,
    position: [((r.coordinates[1] - 70) / 25) * 80 + 10, ((30 - r.coordinates[0]) / 20) * 80 + 10] as [number, number],
    label: r.name,
    riskLevel: r.riskLevel,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Region & Monitoring Control</h1>
        <p className="text-muted-foreground">Manage monitoring regions and officer assignments</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Region Map</h3>
        <MapView points={mapPoints} className="h-[350px]" />
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Region</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Assigned Officer</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Risk Level</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Active Detections</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {regions.map(r => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-card-foreground">{r.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.assignedOfficer}</td>
                  <td className="px-4 py-3"><RiskBadge level={r.riskLevel} /></td>
                  <td className="px-4 py-3 text-card-foreground">{r.activeDetections}</td>
                  <td className="px-4 py-3">
                    <button className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20">Configure</button>
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

export default RegionControl;
