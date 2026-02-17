'use client';

import { EventTypeKey } from '@core/enumerations';
import { DeviceService, EventLoggerService, UserDeviceService } from '@core/services';
import { useAuth } from '@supa/providers';
import { createClientService } from '@supa/utils/client';
import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useDevice, useUserDevice } from '../hooks';
import { createLogger } from '@core/utils';

const logger = createLogger('DeviceProvider');

export interface DeviceProviderProps {
  children: ReactNode;
}

export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children }) => {
  const deviceService = useRef(createClientService(DeviceService)).current;
  const userDeviceService = useRef(createClientService(UserDeviceService)).current;
  const eventLoggerService = useRef(createClientService(EventLoggerService)).current;
  const { isAuthenticated, logout } = useAuth();
  const { device, refetch: refetchDevice } = useDevice();
  const { userDevice, refetch: refetchUserDevice } = useUserDevice();
  const hasInitialized = useRef(false);

  const trackSeen = useCallback(async () => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    const lastSeenStr = localStorage.getItem('deviceLastSeen');
    if (lastSeenStr && new Date().getTime() - new Date(lastSeenStr).getTime() < 60 * 60 * 1000) {
      return;
    }

    await deviceService.trackSeen();
    localStorage.setItem('deviceLastSeen', new Date().toISOString());
  }, [deviceService]);

  const handleForceLogout = useCallback(async () => {
    if (userDevice?.forceLogout) {
      if (isAuthenticated) {
        try {
          await logout();
          toast.success('You have been logged out due to a forced logout from another device.');
          eventLoggerService.log(EventTypeKey.ForcedLogout, { deviceId: userDevice.deviceId });
        } catch (error) {
          logger.error('Error during forced logout:', error);
          toast.error('An error occurred while logging you out. Please try again later.');
          eventLoggerService.log(EventTypeKey.DeviceForcedLogoutFailed, {
            error: error instanceof Error ? error.message : error
          });
        }
      } else {
        userDeviceService.update(userDevice.id, { forceLogout: false });
      }
    }
  }, [logout, isAuthenticated, userDevice, eventLoggerService, userDeviceService]);

  const handleDeviceSusbscriptions = useCallback(() => {
    const subscriptions: (() => void)[] = [];
    if (device) {
      subscriptions.push(
        deviceService.subscribeToRowById(device.id, () => {
          refetchDevice();
          refetchUserDevice();
        })
      );
    }

    if (userDevice) {
      subscriptions.push(
        userDeviceService.subscribeToRowById(userDevice.id, () => {
          refetchDevice();
          refetchUserDevice();
        })
      );
    }

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, [device, deviceService, refetchDevice, userDevice, userDeviceService, refetchUserDevice]);

  useEffect(() => {
    trackSeen();
    handleForceLogout();
    return handleDeviceSusbscriptions();
  }, [trackSeen, handleForceLogout, handleDeviceSusbscriptions]);

  return children;
};
