'use client';

import 'leaflet/dist/leaflet.css';
import { MapPinIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GeoPoint } from '../types';
import { useCurbyMarker } from './curby-marker';

interface LeafletMapProps {
  location: GeoPoint;
  useCustomMarker?: boolean;
}

export function LeafletMap({ location, useCustomMarker = false }: LeafletMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [MapComponents, setMapComponents] = useState<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MapContainer: React.ComponentType<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TileLayer: React.ComponentType<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Marker: React.ComponentType<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Popup: React.ComponentType<any>;
  } | null>(null);

  const coordinates = location.coordinates;
  const longitude = coordinates[0];
  const latitude = coordinates[1];

  // Get custom marker data if enabled
  const customMarkerData = useCurbyMarker({
    position: [latitude, longitude],
    isSelected: false
  });

  useEffect(() => {
    setIsClient(true);

    // Dynamically import all leaflet dependencies
    const loadLeaflet = async () => {
      try {
        // Leaflet CSS should be imported at the top level via the main component

        // Import Leaflet and React Leaflet components
        const [leafletModule, reactLeafletModule] = await Promise.all([import('leaflet'), import('react-leaflet')]);

        const L = leafletModule.default;

        // Fix default marker icons
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
        });

        setMapComponents({
          MapContainer: reactLeafletModule.MapContainer,
          TileLayer: reactLeafletModule.TileLayer,
          Marker: reactLeafletModule.Marker,
          Popup: reactLeafletModule.Popup
        });

        // Invalidate size on mount to fix display issues
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 100);
      } catch (error) {
        console.error('Failed to load Leaflet:', error);
      }
    };

    loadLeaflet();
  }, []);

  if (!isClient || !MapComponents) {
    return (
      <div className="w-full h-64 rounded-lg overflow-hidden border border-border bg-muted/20 flex items-center justify-center">
        <div className="text-center">
          <MapPinIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2 animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup } = MapComponents;

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        className="leaflet-container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker
          position={[latitude, longitude]}
          icon={useCustomMarker && customMarkerData ? customMarkerData.icon : undefined}
        >
          <Popup>
            <div className="text-center">
              <MapPinIcon className="w-4 h-4 mx-auto mb-1 text-green-600" />
              <p className="font-medium">Item Location</p>
              <p className="text-xs text-muted-foreground">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
