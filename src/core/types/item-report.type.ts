import { GenericRecord } from '@supa/types';

export interface ItemReport extends GenericRecord {
  itemId: string;
  reporterId: string;
  reportedAt: Date | string;
  reason?: string | null;
  reviewId?: string | null;
}
