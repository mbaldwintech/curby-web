import { GenericRecord } from '@supa/types';

export interface SupportSlaConfig extends GenericRecord {
  category: string;
  priority: string;
  responseTimeHours: number;
  resolutionTimeHours: number;
  active: boolean;
}
