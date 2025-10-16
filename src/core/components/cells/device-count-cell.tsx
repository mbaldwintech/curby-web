'use client';

import { createClientService } from '@supa/utils/client';
import { useEffect, useRef, useState } from 'react';
import { UserDeviceService } from '../../services';

export const DeviceCountCell = ({ userId }: { userId?: string | null }) => {
  const userDeviceService = useRef(createClientService(UserDeviceService)).current;
  const [deviceCount, setDeviceCount] = useState<number>(0);

  useEffect(() => {
    if (userId) {
      userDeviceService
        .count([
          { column: 'userId', operator: 'eq', value: userId },
          { column: 'active', operator: 'eq', value: true }
        ])
        .then((curbyCoinTransaction) => {
          if (curbyCoinTransaction !== null) {
            setDeviceCount(curbyCoinTransaction);
          }
        })
        .catch(() => {
          setDeviceCount(0);
        });
    } else {
      setDeviceCount(0);
    }
  }, [userId, userDeviceService]);

  if (!userId || !deviceCount) {
    return 0;
  }

  return deviceCount;
};
