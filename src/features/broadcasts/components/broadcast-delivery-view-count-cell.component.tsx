'use client';

import { useAsyncMemo } from '@core/hooks';
import { BroadcastDeliveryViewService } from '@core/services';
import { createClientService } from '@supa/utils/client';
import { useRef } from 'react';

export const BroadcastDeliveryViewCountCell = ({ broadcastDeliveryId }: { broadcastDeliveryId?: string | null }) => {
  const broadcastDeliveryService = useRef(createClientService(BroadcastDeliveryViewService)).current;
  const broadcastDeliveryViewCount = useAsyncMemo(async () => {
    if (!broadcastDeliveryId) return null;
    return broadcastDeliveryService
      .count({ column: 'broadcastDeliveryId', operator: 'eq', value: broadcastDeliveryId })
      .catch(() => {
        return null;
      });
  }, [broadcastDeliveryId]);

  return broadcastDeliveryViewCount ?? 0;
};
