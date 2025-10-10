import { GenericRecord } from '@supa/types';

export interface EventType extends GenericRecord {
  key: string;
  category: string;
  name: string;
  description?: string;
  validFrom: Date | string;
  validTo?: Date | string;
  max?: number;
  maxPerDay?: number;
  condition?: Record<string, unknown>;
  active: boolean;
}
