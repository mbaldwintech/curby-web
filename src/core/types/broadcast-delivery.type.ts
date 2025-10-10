import { GenericRecord } from '@supa/types';

export interface BroadcastDelivery extends GenericRecord {
  broadcastId: string;
  scheduleId?: string | null;
  scheduledFor: Date;
  sentAt?: Date | null;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'canceled' | 'active' | 'archived';
  error?: string | null;
}
