'use client';

import { useAsyncMemo } from '@core/hooks';
import { BroadcastDeliveryService } from '@core/services';
import { createClientService } from '@supa/utils/client';
import { format } from 'date-fns';
import { useRef } from 'react';

export const BroadcastDeliveryCell = ({ broadcastDeliveryId }: { broadcastDeliveryId?: string | null }) => {
  const broadcastDeliveryService = useRef(createClientService(BroadcastDeliveryService)).current;
  const broadcastDelivery = useAsyncMemo(async () => {
    if (!broadcastDeliveryId) return null;
    return broadcastDeliveryService
      .getOneOrNull({ column: 'id', operator: 'eq', value: broadcastDeliveryId }, 'createdAt', false)
      .then((broadcastDelivery) => {
        if (broadcastDelivery !== null) {
          return broadcastDelivery;
        }
      })
      .catch(() => {
        return null;
      });
  }, [broadcastDeliveryId]);

  if (!broadcastDeliveryId || !broadcastDelivery) {
    return null;
  }

  return format(broadcastDelivery.scheduledFor, 'PPpp');
};
