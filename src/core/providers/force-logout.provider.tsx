'use client';

import { showErrorToast, showSuccessToast } from '@common/utils';
import { useAuth } from '@supa/providers';
import { createClientService } from '@supa/utils/client';
import { ReactNode, useEffect, useRef } from 'react';
import { EventTypeKey } from '../enumerations';
import { useDevice, useUserDevice } from '../hooks';
import { DeviceService, EventLoggerService, UserDeviceService } from '../services';

export interface ForceLogoutProviderProps {
  children: ReactNode;
}

export const ForceLogoutProvider: React.FC<ForceLogoutProviderProps> = ({ children }) => {
  const deviceService = useRef(createClientService(DeviceService)).current;
  const userDeviceService = useRef(createClientService(UserDeviceService)).current;
  const eventLoggerService = useRef(createClientService(EventLoggerService)).current;
  const { isAuthenticated, logout } = useAuth();
  const { device, refetch: refetchDevice } = useDevice();
  const { userDevice, refetch: refetchUserDevice } = useUserDevice();

  useEffect(() => {
    if (userDevice?.forceLogout) {
      if (isAuthenticated) {
        logout()
          .then(() => {
            showSuccessToast('You have been logged out due to a forced logout from another device.');
            eventLoggerService.log(EventTypeKey.ForcedLogout, { deviceId: userDevice.deviceId });
          })
          .catch((error) => {
            console.error('Error during forced logout:', error);
            showErrorToast('An error occurred while logging you out. Please try again later.');
            eventLoggerService.log(EventTypeKey.DeviceForcedLogoutFailed, { error: error.message });
          });
      } else {
        userDeviceService.update(userDevice.id, { forceLogout: false });
      }
    }
  }, [userDevice, logout, isAuthenticated, eventLoggerService, userDeviceService]);

  useEffect(() => {
    let deviceSubscription: (() => void) | undefined;
    let userDeviceSubscription: (() => void) | undefined;
    if (device) {
      deviceSubscription = deviceService.subscribeToRowById(device.id, () => {
        refetchDevice();
        refetchUserDevice();
      });
    }

    if (userDevice) {
      userDeviceSubscription = userDeviceService.subscribeToRowById(userDevice.id, () => {
        refetchDevice();
        refetchUserDevice();
      });
    }

    return () => {
      deviceSubscription?.();
      userDeviceSubscription?.();
    };
  }, [device, userDevice, refetchDevice, refetchUserDevice, deviceService, userDeviceService]);

  return children;
};
