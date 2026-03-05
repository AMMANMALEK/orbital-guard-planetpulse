import { useState } from 'react';
import { regions } from '@/data/mockData';
import MapView from '@/components/MapView';
import RiskBadge from '@/components/RiskBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const RegionControl = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(undefined);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Region & Monitoring Control</h1>
          <p className="text-muted-foreground">Manage monitoring regions and officer assignments</p>
        </div>
        <Select defaultValue="all" onValueChange={(v) => setSelectedRegion(v === 'all' ? undefined : v)}>
          <SelectTrigger className="w-[200px] bg-card border-border/50">
            <SelectValue placeholder="Focus Map Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Global View</SelectItem>
            {regions.map(r => (
              <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
          Region Map
          {selectedRegion && <span className="text-xs font-normal text-muted-foreground ml-2 px-2 py-0.5 bg-muted rounded-full">Focused: {selectedRegion}</span>}
        </h3>
        <MapView className="h-[450px]" filterRegion={selectedRegion} />
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
                    <button
                      onClick={() => setSelectedRegion(r.name)}
                      className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                    >
                      Locate
                    </button>
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
