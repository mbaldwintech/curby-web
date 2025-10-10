import { GenericRecord } from '@supa/types';

export interface BroadcastDeliveryView extends GenericRecord {
  broadcastDeliveryId: string;
  deviceId?: string | null;
  userId?: string | null;
  viewedAt?: Date | null;
  dismissedAt?: Date | null;
  clickedAt?: Date | null;
}
