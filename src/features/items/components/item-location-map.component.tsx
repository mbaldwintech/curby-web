'use client';

import { Button, LeafletMap, LinkButton } from '@core/components';
import { GeoPoint } from '@core/types';
import { CopyIcon, ExternalLinkIcon, MapPinIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn, createLogger } from '@core/utils';

const logger = createLogger('ItemLocationMap');

interface ItemLocationMapProps {
  location?: GeoPoint | null;
  containerClassName?: string;
  mapContainerClassName?: string;
}

export function ItemLocationMap({ location, containerClassName, mapContainerClassName }: ItemLocationMapProps) {
  // Extract coordinates
  const coordinates = location?.coordinates;
  const longitude = coordinates?.[0];
  const latitude = coordinates?.[1];

  // Create external map links
  const googleMapsUrl =
    coordinates && latitude && longitude ? `https://www.google.com/maps?q=${latitude},${longitude}&z=15` : null;

  // Validation
  if (!location || !coordinates || coordinates.length !== 2) {
    return (
      <div className="flex items-center justify-center h-48 bg-muted/20 rounded-lg border-2 border-dashed border-border">
        <div className="text-center">
          <MapPinIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Location not available</p>
        </div>
      </div>
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
      <div
        className={cn(
          'flex items-center justify-center h-48 bg-muted/20 rounded-lg border-2 border-dashed border-border',
          containerClassName
        )}
      >
        <div className="text-center">
          <MapPinIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Invalid coordinates</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col relative bg-muted/30 rounded-lg h-full w-full', containerClassName)}>
      {/* Interactive Leaflet Map */}
      <LeafletMap location={location} useCustomMarker={true} containerClassName={mapContainerClassName} />

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex items-center gap-2 z-50 rounded-lg bg-muted/70 p-1">
        {googleMapsUrl && (
          <LinkButton variant="ghost" size="icon-sm" href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLinkIcon size="sm" />
          </LinkButton>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (latitude && longitude) {
              navigator.clipboard
                .writeText(`${latitude}, ${longitude}`)
                .then(() => {
                  toast.success('Coordinates copied to clipboard!');
                })
                .catch((err) => {
                  logger.error('Failed to copy coordinates:', err);
                  toast.error('Failed to copy coordinates.');
                });
            }
          }}
        >
          <CopyIcon size="sm" />
        </Button>
      </div>

      {/* Coordinate Details */}
      <div className="absolute bottom-0 left-0 right-0 grid grid-cols-2 gap-4 text-sm p-3 pt-5 z-50 bg-gradient-to-t from-muted to-transparent rounded-b-lg">
        <div>
          <div className="font-medium">Latitude</div>
          <div className="font-mono">{latitude.toFixed(6)}</div>
        </div>
        <div>
          <div className="font-medium">Longitude</div>
          <div className="font-mono">{longitude.toFixed(6)}</div>
        </div>
      </div>
    </div>
  );
}
