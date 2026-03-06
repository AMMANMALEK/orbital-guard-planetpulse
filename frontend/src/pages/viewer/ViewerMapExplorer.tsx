import MapView from '@/components/MapView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map } from 'lucide-react';

export default function ViewerMapExplorer() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Public Map Explorer</h1>
        <p className="text-muted-foreground">Filter by violation type, risk level, toggle heatmap, cluster markers</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Interactive Map
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Use the filters to explore detections by type, risk level. Toggle heatmap and cluster views.
          </p>
        </CardHeader>
        <CardContent>
          <MapView className="h-[500px]" />
        </CardContent>
      </Card>
    </div>
  );
}
