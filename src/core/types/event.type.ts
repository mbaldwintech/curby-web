import { GenericRecord } from '@supa/types';

export interface Event extends GenericRecord {
  deviceId?: string;
  userId?: string;
  eventKey: string;
  eventTypeId?: string;
  metadata?: Record<string, unknown>;
}
