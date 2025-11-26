import { BroadcastDeliveryStatus } from '@core/enumerations';
import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

export interface BroadcastDelivery extends GenericRecord {
  broadcastId: string;
  scheduleId?: string | null;
  scheduledFor: Date;
  sentAt?: Date | null;
  status: BroadcastDeliveryStatus;
  error?: string | null;
}

export const BroadcastDeliveryMetadata: GenericRecordMetadata<BroadcastDelivery> = {
  broadcastId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  scheduleId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  scheduledFor: {
    isArray: false,
    isNullable: false,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  sentAt: {
    isArray: false,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  status: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  error: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: false
  },
  ...GenericRecordMetadataBase
};
