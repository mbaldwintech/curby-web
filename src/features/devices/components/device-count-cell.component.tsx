'use client';

import { CountCell } from '@core/components';
import { UserDeviceService } from '@core/services';
import { useMemo } from 'react';

export const DeviceCountCell = ({ userId }: { userId?: string | null }) => {
  const filters = useMemo(
    () => [
      { column: 'userId' as const, operator: 'eq' as const, value: userId! },
      { column: 'active' as const, operator: 'eq' as const, value: true }
    ],
    [userId]
  );
  return <CountCell service={UserDeviceService} id={userId} filters={filters} />;
};
