'use client';

import { UserDeviceService } from '@core/services';
import { UserDevice } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';
import { ProfileCell } from './profile-cell';

export const UserForDeviceCell = ({ deviceId }: { deviceId?: string | null }) => {
  const userDeviceService = useRef(createClientService(UserDeviceService)).current;
  const [userDevice, setUserDevice] = useState<UserDevice | null>(null);

  useEffect(() => {
    if (deviceId) {
      userDeviceService
        .getOneOrNull([
          { column: 'deviceId', operator: 'eq', value: deviceId },
          { column: 'active', operator: 'eq', value: true }
        ])
        .then((userDevice) => {
          setUserDevice(userDevice);
        })
        .catch(() => {
          setUserDevice(null);
        });
    } else {
      setUserDevice(null);
    }
  }, [deviceId, userDeviceService]);

  return <ProfileCell userId={userDevice?.userId} />;
};
