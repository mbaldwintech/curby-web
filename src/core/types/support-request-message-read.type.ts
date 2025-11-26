import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

export interface SupportRequestMessageRead extends GenericRecord {
  messageId: string;
  userId?: string | null;
  deviceId?: string | null;
  readAt: string; // ISO date string
}

export const SupportRequestMessageReadMetadata: GenericRecordMetadata<SupportRequestMessageRead> = {
  messageId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  userId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  deviceId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  readAt: {
    isArray: false,
    isNullable: false,
    type: 'timestamp',
    searchable: false,
    sortable: true,
    filterable: true
  },
  ...GenericRecordMetadataBase
};
