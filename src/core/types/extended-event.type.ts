import { GenericRecord } from '@supa/types';

export interface ExtendedEvent extends GenericRecord {
  systemDeviceId?: string;
  persistentDeviceId?: string;
  deviceLabel?: string;
  deviceType?: string;
  deviceName?: string;

  userId?: string;
  username?: string;
  avatarUrl?: string;
  role?: string;
  status?: string;

  eventKey: string;
  eventTypeId?: string;
  eventTypeCategory?: string;
  eventTypeName?: string;
  eventTypeDescription?: string;

  notificationCount: number;
  curbyCoinTransactionCount: number;

  metadata?: Record<string, unknown>;
}
