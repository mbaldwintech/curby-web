import { GenericRecord } from '@supa/types';

export interface FalseTaking extends GenericRecord {
  takerId: string;
  itemId: string;
  takenAt: Date | string;
  restoredAt: Date | string;
}
