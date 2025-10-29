import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

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

export const ScheduleMetadata: GenericRecordMetadata<Schedule> = {
  uid: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  name: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  description: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: false
  },
  ownerType: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  ownerId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  dtStart: {
    isArray: false,
    isNullable: false,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  dtEnd: {
    isArray: false,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  timezone: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  rrule: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: false
  },
  exDates: {
    isArray: true,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: false,
    filterable: false
  },
  rDates: {
    isArray: true,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: false,
    filterable: false
  },
  active: {
    isArray: false,
    isNullable: false,
    type: 'boolean',
    searchable: false,
    sortable: true,
    filterable: true
  },
  metadata: {
    isArray: false,
    isNullable: true,
    type: 'json',
    searchable: false,
    sortable: false,
    filterable: false
  },
  ...GenericRecordMetadataBase
};
