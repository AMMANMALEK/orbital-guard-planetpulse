import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Map as MapIcon } from 'lucide-react';
import RegionPickerMap from './RegionPickerMap';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface OfficerRegionSelectorProps {
  onRegionChange: (region: { name: string; latitude: number; longitude: number }) => void;
  value?: { name: string; latitude: number; longitude: number } | null;
}

export default function OfficerRegionSelector({ onRegionChange, value }: OfficerRegionSelectorProps) {
  const [searchQuery, setSearchQuery] = useState(value?.name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const handleManualSearch = async () => {
    if (!searchQuery) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery
        )}&format=json&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newRegion = {
          name: display_name,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        };
        onRegionChange(newRegion);
        toast.success(`Location found: ${display_name}`);
      } else {
        toast.error('Location not found. Try Map Selection.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Error searching for location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapSelect = (lat: number, lng: number) => {
    // Optionally reverse geocode or just use coordinates for name
    onRegionChange({
      name: `Custom Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      latitude: lat,
      longitude: lng,
    });
    // setIsMapOpen(false); // Keep open if they want to adjust
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search location (e.g. Anand, Gujarat)"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleManualSearch())}
          />
        </div>
        <Button 
          type="button" 
          variant="secondary" 
          onClick={handleManualSearch} 
          disabled={isLoading}
        >
          {isLoading ? '...' : <Search className="h-4 w-4" />}
        </Button>
        <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline">
              <MapIcon className="h-4 w-4 mr-2" />
              Map
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Select Region on Map</DialogTitle>
            </DialogHeader>
            <RegionPickerMap 
              onLocationSelect={handleMapSelect}
              selectedLocation={value ? [value.latitude, value.longitude] : null}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" onClick={() => setIsMapOpen(false)}>Done</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {value && (
        <div className="text-xs p-3 rounded-md bg-primary/5 border border-primary/20 space-y-1">
          <p className="font-semibold text-primary">Selected Region:</p>
          <p className="text-muted-foreground">{value.name}</p>
          <p className="font-mono text-[10px]">Lat: {value.latitude.toFixed(6)}, Lng: {value.longitude.toFixed(6)}</p>
        </div>
      )}
    </div>
  );
}
