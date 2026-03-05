import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap, ZoomControl, Polygon, Tooltip as LeafletTooltip } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { cn } from '@/lib/utils';
import {
  Maximize,
  Layers,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Map as MapIcon,
  Satellite,
  Info,
  Filter,
  RefreshCw,
  Crosshair,
  Calendar,
  History,
  Target,
  Activity
} from 'lucide-react';
import HeatmapLayer from './MapHeatmap';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import { toast } from 'sonner';

// --- Types ---

interface DetectionMetadata {
  satelliteSource: string;
  spatialResolution: string;
  areaHectares: number;
}

interface Detection {
  id: number;
  detectionType: string;
  riskScore: number;
  riskLevel: string;
  latitude: number;
  longitude: number;
  boundary?: [number, number][]; // Polygon coordinates
  status: string;
  timestamp: string;
  locationDetails: string;
  confidence: number;
  metadata: DetectionMetadata;
}

interface MapViewProps {
  className?: string;
  filterRegion?: string;
}

// --- Icons ---

const getMarkerColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'low': return '#22c55e'; // Green
    case 'medium': return '#eab308'; // Yellow
    case 'high': return '#f97316'; // Orange
    case 'critical': return '#ef4444'; // Red
    default: return '#64748b'; // Slate
  }
};

const createCustomIcon = (riskLevel: string) => {
  const color = getMarkerColor(riskLevel);
  return L.divIcon({
    html: `<div class="marker-pin" style="background-color: ${color}; box-shadow: 0 0 10px ${color}"></div>`,
    className: 'custom-div-icon',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

// --- Helper Components ---

const MapControls = ({
  onReset,
  onFitBounds,
  isHeatmapVisible,
  setHeatmapVisible
}: {
  onReset: () => void;
  onFitBounds: () => void;
  isHeatmapVisible: boolean;
  setHeatmapVisible: (v: boolean) => void;
}) => {
  return (
    <div className="absolute bottom-24 right-6 z-[1000] flex flex-col gap-2">
      <Button
        variant="secondary"
        size="icon"
        className="h-10 w-10 shadow-lg bg-card/90 backdrop-blur border border-border/50 hover:bg-accent transition-all duration-300"
        onClick={onReset}
        title="Reset View"
      >
        <History className="h-5 w-5" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className="h-10 w-10 shadow-lg bg-card/90 backdrop-blur border border-border/50 hover:bg-accent transition-all duration-300"
        onClick={onFitBounds}
        title="Fit to Region"
      >
        <Target className="h-5 w-5" />
      </Button>
      <Button
        variant={isHeatmapVisible ? "default" : "secondary"}
        size="icon"
        className={cn("h-10 w-10 shadow-lg bg-card/90 backdrop-blur border border-border/50 transition-all duration-300", isHeatmapVisible && "bg-primary text-primary-foreground")}
        onClick={() => setHeatmapVisible(!isHeatmapVisible)}
        title="Toggle Heatmap"
      >
        <Layers className="h-5 w-5" />
      </Button>
    </div>
  );
};

const MapLegend = () => (
  <div className="absolute bottom-6 left-6 z-[1000] p-4 rounded-xl border border-border/50 bg-card/90 backdrop-blur shadow-2xl hidden sm:block min-w-[140px]">
    <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground mb-3 flex items-center gap-2">
      <Info className="h-3 w-3" />
      Detection Risk
    </h4>
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 group">
        <div className="h-3 w-3 rounded-full bg-[#ef4444] animate-pulse shadow-[0_0_8px_#ef4444]" />
        <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground transition-colors">Critical</span>
      </div>
      <div className="flex items-center gap-3 group">
        <div className="h-3 w-3 rounded-full bg-[#f97316] shadow-[0_0_8px_#f97316]" />
        <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground transition-colors">High</span>
      </div>
      <div className="flex items-center gap-3 group">
        <div className="h-3 w-3 rounded-full bg-[#eab308] shadow-[0_0_8px_#eab308]" />
        <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground transition-colors">Medium</span>
      </div>
      <div className="flex items-center gap-3 group">
        <div className="h-3 w-3 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]" />
        <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground transition-colors">Low</span>
      </div>
    </div>
  </div>
);

// Component to handle map view changes
const MapEffect = ({ center, zoom, bounds }: { center?: [number, number], zoom?: number, bounds?: L.LatLngBounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    } else if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom, bounds]);
  return null;
};

// --- Main Component ---

const MapView = ({ className, filterRegion }: MapViewProps) => {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isHeatmapVisible, setHeatmapVisible] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  const mapRef = useRef<L.Map | null>(null);

  const fetchDetections = useCallback(async () => {
    try {
      setLoading(true);
      // Simulating API response from GET /detections
      const mockDetections: Detection[] = [
        {
          id: 1,
          detectionType: 'Illegal Mining',
          riskScore: 95,
          riskLevel: 'Critical',
          latitude: 13.217,
          longitude: 75.143,
          boundary: [
            [13.218, 75.142],
            [13.219, 75.144],
            [13.216, 75.145],
            [13.215, 75.143]
          ],
          status: 'detected',
          timestamp: new Date().toISOString(),
          locationDetails: 'Kudremukh National Park Southern Sector',
          confidence: 98.4,
          metadata: { satelliteSource: 'Sentinel-2', spatialResolution: '10m', areaHectares: 12.5 }
        },
        {
          id: 2,
          detectionType: 'Deforestation',
          riskScore: 78,
          riskLevel: 'High',
          latitude: 11.412,
          longitude: 76.695,
          boundary: [
            [11.415, 76.690],
            [11.418, 76.695],
            [11.410, 76.700],
            [11.408, 76.692]
          ],
          status: 'investigating',
          timestamp: new Date().toISOString(),
          locationDetails: 'Nilgiri Biosphere Reserve corridor',
          confidence: 91.2,
          metadata: { satelliteSource: 'Landsat-8', spatialResolution: '30m', areaHectares: 45.2 }
        },
        {
          id: 3,
          detectionType: 'River Encroachment',
          riskScore: 52,
          riskLevel: 'Medium',
          latitude: 21.842,
          longitude: 88.921,
          status: 'resolved',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          locationDetails: 'Matla River Basin – Sundarbans',
          confidence: 85.7,
          metadata: { satelliteSource: 'Sentinel-1 (SAR)', spatialResolution: '5m', areaHectares: 3.8 }
        },
        {
          id: 4,
          detectionType: 'Illegal Mining',
          riskScore: 24,
          riskLevel: 'Low',
          latitude: 25.105,
          longitude: 73.542,
          status: 'detected',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          locationDetails: 'Aravalli Hills – Rajasthan Buffer Zone',
          confidence: 76.3,
          metadata: { satelliteSource: 'PlanetScope', spatialResolution: '3m', areaHectares: 1.2 }
        },
        {
          id: 5,
          detectionType: 'Deforestation',
          riskScore: 89,
          riskLevel: 'High',
          latitude: 26.654,
          longitude: 93.412,
          boundary: [
            [26.658, 93.408],
            [26.660, 93.415],
            [26.650, 93.418],
            [26.648, 93.410]
          ],
          status: 'detected',
          timestamp: new Date().toISOString(),
          locationDetails: 'Kaziranga Buffer Forest',
          confidence: 94.8,
          metadata: { satelliteSource: 'Sentinel-2', spatialResolution: '10m', areaHectares: 28.4 }
        },
        {
          id: 6,
          detectionType: 'Illegal Mining',
          riskScore: 68,
          riskLevel: 'High',
          latitude: 22.512,
          longitude: 80.123,
          status: 'investigating',
          timestamp: new Date().toISOString(),
          locationDetails: 'Central India Reserve Area',
          confidence: 88.0,
          metadata: { satelliteSource: 'Landsat-9', spatialResolution: '30m', areaHectares: 8.5 }
        }
      ];

      setDetections(mockDetections);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch detections:', error);
      toast.error('Sync error: Live map data unreachable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDetections();
    const interval = setInterval(fetchDetections, 30000); // 30s Polling
    return () => clearInterval(interval);
  }, [fetchDetections]);

  const filteredDetections = useMemo(() => {
    return detections.filter(d => {
      const matchType = typeFilter === 'all' || d.detectionType.toLowerCase().replace(/\s+/g, '-') === typeFilter;
      const matchRisk = riskFilter === 'all' || d.riskLevel.toLowerCase() === riskFilter;
      const matchStatus = statusFilter === 'all' || d.status.toLowerCase() === statusFilter;
      const matchRegion = !filterRegion || d.locationDetails.includes(filterRegion);

      // Simple date filter logic
      const detectionDate = new Date(d.timestamp);
      const now = new Date();
      let matchDate = true;
      if (dateRange === '24h') matchDate = (now.getTime() - detectionDate.getTime()) <= 86400000;
      else if (dateRange === '7d') matchDate = (now.getTime() - detectionDate.getTime()) <= 604800000;
      else if (dateRange === '30d') matchDate = (now.getTime() - detectionDate.getTime()) <= 2592000000;

      return matchType && matchRisk && matchStatus && matchRegion && matchDate;
    });
  }, [detections, typeFilter, riskFilter, statusFilter, filterRegion, dateRange]);

  const heatmapPoints = useMemo<[number, number, number][]>(() => {
    return filteredDetections.map(d => [d.latitude, d.longitude, d.riskScore / 100]);
  }, [filteredDetections]);

  const handleReset = () => {
    if (mapRef.current) {
      mapRef.current.setView([20, 78], 5);
      toast.info("Map view reset to global overview");
    }
  };

  const handleFitBounds = () => {
    if (mapRef.current && filteredDetections.length > 0) {
      const bounds = L.latLngBounds(filteredDetections.map(d => [d.latitude, d.longitude]));
      mapRef.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 12 });
      toast.info("Map adjusted to show active detections");
    } else {
      toast.warning("No interactive detections in current filter");
    }
  };

  // Determine if clustering is needed (as per 100+ rule)
  const useClustering = filteredDetections.length > 100;

  return (
    <div className={cn("relative flex flex-col h-full w-full bg-[#020617] rounded-xl overflow-hidden border border-border shadow-[0_0_50px_rgba(0,0,0,0.5)] group", className)}>

      {/* Centralized Monitoring Header - Outside the Map */}
      <div className="flex flex-col xl:flex-row items-center justify-between px-6 py-4 bg-card/60 border-b border-border/40 backdrop-blur-md gap-6">
        {/* Branding */}
        <div className="flex items-center gap-4 min-w-max">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-[inset_0_0_12px_rgba(16,185,129,0.1)] border border-primary/20">
            <Shield className="h-6 w-6 text-primary shadow-sm" />
          </div>
          <div>
            <h3 className="text-sm font-black leading-none uppercase tracking-[0.2em] text-primary">PLANETPULSE AI</h3>
            <p className="text-[10px] text-muted-foreground mt-1.5 font-mono uppercase tracking-widest font-bold">LIVE SURVEILLANCE FEED</p>
          </div>
        </div>

        {/* Global Filter Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1 rounded-xl bg-muted/20 border border-border/20 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 px-3 border-r border-border/20">
            <Filter className="h-3.5 w-3.5 text-primary/70" />
            <span className="text-[10px] uppercase font-black tracking-tighter text-muted-foreground hidden sm:inline">Filters</span>
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-[140px] text-[11px] bg-transparent border-none hover:bg-white/5 transition-all rounded-lg focus:ring-0 font-bold">
              <SelectValue placeholder="Detector Type" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-3xl border-border/40">
              <SelectItem value="all">All Detectors</SelectItem>
              <SelectItem value="illegal-mining">Illegal Mining</SelectItem>
              <SelectItem value="deforestation">Deforestation</SelectItem>
              <SelectItem value="river-encroachment">River Encroachment</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-4 w-px bg-border/20 mx-0.5" />

          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="h-8 w-[110px] text-[11px] bg-transparent border-none hover:bg-white/5 transition-all rounded-lg focus:ring-0 font-bold">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-3xl border-border/40">
              <SelectItem value="all">All Risk</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-4 w-px bg-border/20 mx-0.5" />

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[120px] text-[11px] bg-transparent border-none hover:bg-white/5 transition-all rounded-lg focus:ring-0 font-bold">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-3xl border-border/40">
              <SelectItem value="all">Any Status</SelectItem>
              <SelectItem value="detected">Detected</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-4 w-px bg-border/20 mx-0.5" />

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="h-8 w-[120px] text-[11px] bg-transparent border-none hover:bg-white/5 transition-all rounded-lg focus:ring-0 font-bold">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-primary/70" />
                <SelectValue placeholder="Timeframe" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-3xl border-border/40">
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="all">Archive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* System Status Indicators */}
        <div className="flex items-center gap-6 min-w-max">
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-mono text-emerald-400 flex items-center gap-2 tracking-widest font-black">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              </span>
              ACTIVE FEED
            </p>
            <p className="text-[10px] font-mono text-muted-foreground/60 mt-1.5 uppercase font-bold tracking-tighter">REFRESHED: {lastUpdated.toLocaleTimeString()}</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 border-border/40 hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-xl bg-card/30"
            onClick={() => fetchDetections()}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4 transition-all", loading && "animate-spin text-primary")} />
          </Button>
        </div>
      </div>

      {/* Interactive Map Area */}
      <div className="relative flex-grow min-h-0 overflow-hidden">

        {/* Map Content */}
        <div className="flex-grow z-0 relative h-full">
          <MapContainer
            center={[20, 78]}
            zoom={5}
            scrollWheelZoom={true}
            className="h-full w-full"
            zoomControl={false}
            ref={(map) => { mapRef.current = map; }}
            style={{ background: '#020617' }}
          >
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Satellite View">
                <TileLayer
                  attribution='&copy; ESRI World Imagery'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Street View">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>
            </LayersControl>

            <ZoomControl position="topright" />

            {isHeatmapVisible && <HeatmapLayer points={heatmapPoints} />}

            {/* Conditional Clustering */}
            {useClustering ? (
              <MarkerClusterGroup
                chunkedLoading
                maxClusterRadius={50}
                showCoverageOnHover={false}
                polygonOptions={{
                  fillColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary))',
                  weight: 1,
                  opacity: 0.4,
                  fillOpacity: 0.1,
                }}
              >
                {filteredDetections.map((detection) => (
                  <DetectionMarker key={detection.id} detection={detection} />
                ))}
              </MarkerClusterGroup>
            ) : (
              filteredDetections.map((detection) => (
                <DetectionMarker key={detection.id} detection={detection} />
              ))
            )}

            {/* Boundaries / Polygons */}
            {filteredDetections.map(detection => detection.boundary && (
              <Polygon
                key={`poly-${detection.id}`}
                positions={detection.boundary}
                pathOptions={{
                  color: getMarkerColor(detection.riskLevel),
                  fillColor: getMarkerColor(detection.riskLevel),
                  fillOpacity: 0.3,
                  weight: 2,
                  dashArray: '5, 5'
                }}
              >
                <LeafletTooltip sticky className="bg-card text-card-foreground border-border rounded px-2 py-1 text-[10px] font-bold">
                  {detection.detectionType} (Area: {detection.metadata.areaHectares} ha)
                </LeafletTooltip>
              </Polygon>
            ))}

            {/* Auto centering when region filter changes */}
            {filterRegion && <MapEffect bounds={filteredDetections.length > 0 ? L.latLngBounds(filteredDetections.map(d => [d.latitude, d.longitude])) : undefined} />}
          </MapContainer>

          <MapLegend />
          <MapControls
            onReset={handleReset}
            onFitBounds={handleFitBounds}
            isHeatmapVisible={isHeatmapVisible}
            setHeatmapVisible={setHeatmapVisible}
          />
        </div>

        {loading && !detections.length && (
          <div className="absolute inset-0 z-[2000] bg-background/60 backdrop-blur-md flex items-center justify-center">
            <div className="flex flex-col items-center gap-6 p-10 rounded-3xl border border-white/5 bg-black/40 shadow-2xl">
              <div className="relative">
                <div className="h-20 w-20 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <Activity className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-white tracking-[0.3em] animate-pulse uppercase">Initializing Neural Feed</p>
                <p className="text-[10px] text-muted-foreground mt-2 font-mono">ESTABLISHING CRYPTOGRAPHIC SATELLITE UPLINK...</p>
              </div>
            </div>
          </div>
        )}

        {/* Global CSS for Map UI Polishing */}
        <style dangerouslySetInnerHTML={{
          __html: `
        .leaflet-container {
          background: #020617 !important;
        }
        .marker-pin {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 15px rgba(0,0,0,0.5);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .marker-pin:hover {
          transform: scale(1.6) rotate(15deg);
          border-width: 3px;
          z-index: 2000 !important;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          background: hsl(var(--card) / 0.9);
          backdrop-filter: blur(20px);
          color: hsl(var(--card-foreground));
          border-radius: 20px;
          padding: 8px;
          border: 1px solid hsl(var(--border) / 0.4);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .custom-popup .leaflet-popup-tip {
          background: hsl(var(--card) / 0.9);
        }
        .leaflet-control-layers {
            border: 1px solid hsl(var(--border) / 0.3) !important;
            border-radius: 12px !important;
            background: hsl(var(--card) / 0.8) !important;
            backdrop-filter: blur(10px) !important;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2) !important;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
      </div>
    </div>
  );
};

// Sub-component for individual markers for cleaner rendering
const DetectionMarker = ({ detection }: { detection: Detection }) => (
  <Marker
    position={[detection.latitude, detection.longitude]}
    icon={createCustomIcon(detection.riskLevel)}
  >
    <Popup className="custom-popup" minWidth={320}>
      <div className="space-y-4 font-sans p-2">
        <div className="flex items-center justify-between border-b border-border/30 pb-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">OBJ #{detection.id}</span>
            </div>
            <span className="text-base font-bold text-foreground mt-1">{detection.detectionType}</span>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "px-3 py-1 rounded-full border-2 uppercase font-black tracking-tighter text-[10px]",
              detection.riskLevel === 'Critical' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                detection.riskLevel === 'High' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                  detection.riskLevel === 'Medium' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                    "bg-green-500/10 text-green-500 border-green-500/20"
            )}
          >
            {detection.riskLevel}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 p-2 rounded-xl bg-muted/20 border border-border/10">
            <p className="text-[10px] text-muted-foreground uppercase font-black flex items-center gap-1.5">
              <Maximize className="h-3 w-3" /> Area
            </p>
            <p className="text-sm font-bold text-foreground">{detection.metadata.areaHectares} Hectares</p>
          </div>
          <div className="space-y-1.5 p-2 rounded-xl bg-muted/20 border border-border/10">
            <p className="text-[10px] text-muted-foreground uppercase font-black flex items-center gap-1.5">
              <Shield className="h-3 w-3" /> Confidence
            </p>
            <p className="text-sm font-bold text-primary">{detection.confidence}% AI Certainty</p>
          </div>
          <div className="col-span-2 space-y-2">
            <div className="flex justify-between items-center mb-1">
              <p className="text-[10px] text-muted-foreground uppercase font-black">Risk Severity</p>
              <span className="text-xs font-black text-foreground">{detection.riskScore}/100</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-border/20">
              <div
                className={cn(
                  "h-full transition-all duration-1000 ease-out",
                  detection.riskLevel === 'Critical' ? "bg-red-500" :
                    detection.riskLevel === 'High' ? "bg-orange-500" :
                      detection.riskLevel === 'Medium' ? "bg-yellow-500" : "bg-emerald-500"
                )}
                style={{ width: `${detection.riskScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
          <p className="text-[10px] text-primary uppercase font-black mb-1.5 flex items-center gap-2">
            <MapIcon className="h-3 w-3" /> Intelligence Summary
          </p>
          <p className="text-xs leading-relaxed text-foreground/90 italic">
            Detected anomally within {detection.locationDetails}. Status marked as <span className="font-bold underline">{detection.status}</span>.
          </p>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono bg-muted/30 p-2 rounded-lg border border-border/10">
          <span className="flex items-center gap-1.5"><Satellite className="h-3.5 w-3.5" /> Source: {detection.metadata.satelliteSource}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {new Date(detection.timestamp).toLocaleTimeString()}</span>
        </div>

        <Button variant="default" className="w-full py-6 text-xs font-black tracking-[0.1em] group/btn rounded-xl shadow-xl hover:shadow-primary/20 transition-all">
          ACCESS FULL CLASSIFIED DOSSIER
          <Maximize className="ml-2 h-4 w-4 group-hover/btn:scale-110 transition-transform" />
        </Button>
      </div>
    </Popup>
  </Marker>
);

export default MapView;
