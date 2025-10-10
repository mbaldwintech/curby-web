import { IconProps } from '@common/components';
import { GenericRecord } from '@supa/types';

export interface NotificationTemplate extends GenericRecord {
  key: string;
  version: number;
  eventTypeId?: string;
  curbyCoinTransactionTypeId?: string;
  recipient: string;
  deliveryChannel: string;
  category: string;
  titleTemplate?: string;
  bodyTemplate?: string;
  targetRoute?: string;
  iconProps?: { backgroundColor?: string } & IconProps;
  validFrom: Date | string;
  validTo?: Date | string;
  max?: number;
  maxPerDay?: number;
  condition?: string;
  active: boolean;
}
