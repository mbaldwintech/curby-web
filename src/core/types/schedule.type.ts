import { GenericRecord } from '@supa/types';

export interface Schedule extends GenericRecord {
  uid: string;
  name: string;
  description?: string | null;
  ownerType: string;
  ownerId: string;
  dtStart: Date;
  dtEnd?: Date | null;
  timezone?: string | null;
  rrule?: string | null;
  exDates?: Date[] | null;
  rDates?: Date[] | null;
  active: boolean;
  metadata?: Record<string, unknown> | null;
}
