import { GenericRecord } from '@supa/types';

export interface CurbyCoinTransaction extends GenericRecord {
  userId: string;
  curbyCoinTransactionTypeId: string;
  eventId: string;
  amount: number;
  balanceAfter: number;
  description: string;
  occurredAt: Date | string;
}
