import { GenericRecord } from '@supa/types';

export interface SavedItem extends GenericRecord {
  userId: string;
  itemId: string;
  savedAt: Date | string;
}
