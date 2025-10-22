import { GenericRecord } from '@supa/types';
import { IconProps } from '../components/icon.component';

export interface CurbyCoinTransactionType extends GenericRecord {
  key: string;
  eventTypeId: string;
  category: string;
  recipient: string;
  sortOrder: number;
  displayName: string;
  description?: string;
  amount: number;
  iconProps?: { backgroundColor?: string } & IconProps;
  validFrom: Date | string;
  validTo?: Date | string;
  max?: number;
  maxPerDay?: number;
  condition?: Record<string, unknown>;
  active: boolean;
}
