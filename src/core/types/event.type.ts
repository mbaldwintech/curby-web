import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

export interface Event extends GenericRecord {
  deviceId?: string;
  userId?: string;
  eventKey: string;
  eventTypeId?: string;
  metadata?: Record<string, unknown>;
}

export const EventMetadata: GenericRecordMetadata<Event> = {
  deviceId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  userId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  eventKey: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  eventTypeId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
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
