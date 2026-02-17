'use client';

import { CountCell } from '@core/components';
import { BroadcastDeliveryViewService } from '@core/services';
import { useMemo } from 'react';

export const BroadcastDeliveryViewCountCell = ({ broadcastDeliveryId }: { broadcastDeliveryId?: string | null }) => {
  const filters = useMemo(
    () => ({ column: 'broadcastDeliveryId' as const, operator: 'eq' as const, value: broadcastDeliveryId! }),
    [broadcastDeliveryId]
  );
  return <CountCell service={BroadcastDeliveryViewService} id={broadcastDeliveryId} filters={filters} />;
};
