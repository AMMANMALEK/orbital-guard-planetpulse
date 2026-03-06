import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface RegionPickerMapProps {
  initialCenter?: [number, number];
  onLocationSelect: (lat: number, lng: number) => void;
  selectedLocation?: [number, number] | null;
}

function LocationMarker({ onLocationSelect, selectedLocation }: { 
  onLocationSelect: (lat: number, lng: number) => void;
  selectedLocation?: [number, number] | null;
}) {
  const map = useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return selectedLocation ? (
    <Marker position={selectedLocation} />
  ) : null;
}

export default function RegionPickerMap({ 
  initialCenter = [22.5645, 72.9289], // Anand, Gujarat default
  onLocationSelect,
  selectedLocation 
}: RegionPickerMapProps) {
  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={selectedLocation || initialCenter}
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationSelect={onLocationSelect} selectedLocation={selectedLocation} />
      </MapContainer>
    </div>
  );
}
