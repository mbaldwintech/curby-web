import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CopyableStringCell,
  Skeleton
} from '@core/components';
import { DeviceService } from '@core/services';
import { Device } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { Phone } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createLogger, formatDateTime } from '@core/utils';

const logger = createLogger('DeviceCard');

export interface DeviceCardProps {
  deviceId: string;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ deviceId }) => {
  const deviceService = useRef(createClientService(DeviceService)).current;
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await deviceService.getById(deviceId);
      setDevice(d);
    } catch (err) {
      logger.error('Error fetching device details:', err);
      setError('Failed to load device details.');
    } finally {
      setLoading(false);
    }
  }, [deviceService, deviceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-row items-stretch min-h-[120px]">
            <Skeleton className="rounded-full bg-muted/20 flex-shrink-0" style={{ width: 80, height: 80 }} />
            <div className="ml-4 flex-1 flex flex-col space-y-4">
              {[...Array(3)].map((_, i) => (
                <div className="grid grid-cols-2 gap-4" key={i}>
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            Error Loading Device
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="text-destructive font-semibold mb-2">{error}</div>
            <button
              className="px-4 py-2 rounded bg-muted text-foreground border border-input hover:bg-accent"
              onClick={refresh}
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!device) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center p-2.5 rounded-full bg-primary/10">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Device Details</CardTitle>
            <CardDescription>Detailed information about the device.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <h3 className="text-sm text-foreground/70">Device ID</h3>
          <CopyableStringCell value={device.deviceId} />
        </div>
        {device.label && (
          <div>
            <h3 className="text-sm text-foreground/70">Label</h3>
            <CopyableStringCell value={device.label} />
          </div>
        )}
        <div>
          <h2 className="text-medium text-foreground/70">Specs</h2>
          <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
            <div>
              <h3 className="text-sm text-foreground/70">Device Type</h3>
              <p className="font-medium">{device.type}</p>
            </div>
            <div>
              <h3 className="text-sm text-foreground/70">Name</h3>
              <p className="font-medium">{device.deviceName}</p>
            </div>
            <div>
              <h3 className="text-sm text-foreground/70">Platform</h3>
              <p className="font-medium">{device.platform}</p>
            </div>
            <div>
              <h3 className="text-sm text-foreground/70">App Version</h3>
              <p className="font-medium">{device.appVersion}</p>
            </div>
            <div>
              <h3 className="text-sm text-foreground/70">OS Version</h3>
              <p className="font-medium">{device.osVersion}</p>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-medium text-foreground/70">Permissions</h2>
          <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
            <div>
              <h3 className="text-sm text-foreground/70">Camera Enabled</h3>
              <p className="font-medium">{device.cameraEnabled}</p>
            </div>
            <div>
              <h3 className="text-sm text-foreground/70">Push Enabled</h3>
              <p className="font-medium">{device.pushEnabled}</p>
            </div>
            <div>
              <h3 className="text-sm text-foreground/70">Library Enabled</h3>
              <p className="font-medium">{device.libraryEnabled}</p>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-medium text-foreground/70">Activity</h2>
          <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
            <div>
              <h3 className="text-sm text-foreground/70">Joined</h3>
              <p className="font-medium">{formatDateTime(device.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm text-foreground/70">Last Seen</h3>
              <p className="font-medium">{formatDateTime(device.lastSeenAt)}</p>
            </div>
            <div>
              <h3 className="text-sm text-foreground/70">Last Login</h3>
              <p className="font-medium">{formatDateTime(device.lastLogin)}</p>
            </div>
            <div>
              <h3 className="text-sm text-foreground/70">Last Logout</h3>
              <p className="font-medium">{formatDateTime(device.lastLogout)}</p>
            </div>
            <div>
              <h3 className="text-sm text-foreground/70">Last Push Sent At</h3>
              <p className="font-medium">{formatDateTime(device.lastPushSentAt)}</p>
            </div>
          </div>
          {/* {device.location && (
            <>
              <h3 className="text-sm text-foreground/70">Location</h3>
              <ItemLocationMap location={device.location} containerClassName="h-full w-full min-h-[120px]" />
            </>
          )} */}
        </div>
      </CardContent>
    </Card>
  );
};
