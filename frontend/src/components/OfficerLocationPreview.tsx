import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Fix for default marker icon
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface OfficerLocationPreviewProps {
  regionName: string;
  latitude: number;
  longitude: number;
  officerName: string;
}

export default function OfficerLocationPreview({ 
  regionName, 
  latitude, 
  longitude,
  officerName 
}: OfficerLocationPreviewProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1 text-primary hover:text-primary hover:bg-primary/10">
          <MapPin className="h-3.5 w-3.5" />
          <span className="text-xs font-bold">Preview</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-card border-border">
        <DialogHeader className="p-4 border-b border-border bg-muted/30">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-black uppercase tracking-widest text-primary">Officer Deployment</span>
              <span className="text-lg font-bold">{officerName}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-muted-foreground">{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
              <p className="text-[10px] uppercase font-black text-muted-foreground/60">{regionName}</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="h-[400px] w-full relative">
          <MapContainer
            center={[latitude, longitude]}
            zoom={10}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[latitude, longitude]} icon={DefaultIcon}>
              <Popup className="font-sans">
                <div className="p-1">
                  <p className="font-bold text-sm">{officerName}</p>
                  <p className="text-xs text-muted-foreground">{regionName}</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
          
          <div className="absolute bottom-4 left-4 z-[1000]">
            <a 
              href={`https://www.google.com/maps?q=${latitude},${longitude}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-background/90 backdrop-blur border border-border px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-accent transition-colors shadow-lg"
            >
              <ExternalLink className="h-3 w-3" />
              Open in Google Maps
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
