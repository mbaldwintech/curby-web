'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  LinkButton,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@common/components';
import { GeoPoint } from '@common/types';
import { CopyIcon, ExternalLinkIcon, MapPinIcon } from 'lucide-react';
import { useState } from 'react';
import { LeafletMap } from './leaflet-map';

interface ItemLocationMapProps {
  location?: GeoPoint | null;
  title?: string;
}

export function ItemLocationMap({ location, title = 'Item Location' }: ItemLocationMapProps) {
  const [copied, setCopied] = useState(false);

  // Extract coordinates
  const coordinates = location?.coordinates;
  const longitude = coordinates?.[0];
  const latitude = coordinates?.[1];

  // Create external map links
  const googleMapsUrl =
    coordinates && latitude && longitude ? `https://www.google.com/maps?q=${latitude},${longitude}&z=15` : null;

  const handleCopyCoordinates = async () => {
    if (latitude && longitude) {
      try {
        await navigator.clipboard.writeText(`${latitude}, ${longitude}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy coordinates:', err);
      }
    }
  };

  // Validation
  if (!location || !coordinates || coordinates.length !== 2) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 bg-muted/20 rounded-lg border-2 border-dashed border-border">
            <div className="text-center">
              <MapPinIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Location not available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isValidCoordinates =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  if (!isValidCoordinates) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 bg-muted/20 rounded-lg border-2 border-dashed border-border">
            <div className="text-center">
              <MapPinIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Invalid coordinates</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <MapPinIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Location: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Interactive Leaflet Map */}
          <LeafletMap location={location} useCustomMarker={true} />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            {googleMapsUrl && (
              <Tooltip>
                <TooltipTrigger>
                  <LinkButton
                    variant="ghost"
                    size="icon"
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLinkIcon size="sm" />
                  </LinkButton>
                </TooltipTrigger>
                <TooltipContent className="z-[1001]">
                  <p>Open in Google Maps</p>
                </TooltipContent>
              </Tooltip>
            )}

            <button
              onClick={handleCopyCoordinates}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              <CopyIcon className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Coordinates'}
            </button>
          </div>

          {/* Coordinate Details */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-3 rounded-lg">
            <div>
              <div className="font-medium text-muted-foreground">Latitude</div>
              <div className="font-mono">{latitude.toFixed(6)}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Longitude</div>
              <div className="font-mono">{longitude.toFixed(6)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
