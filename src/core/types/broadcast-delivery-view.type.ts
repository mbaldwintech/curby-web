import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

export interface BroadcastDeliveryView extends GenericRecord {
  broadcastDeliveryId: string;
  deviceId?: string | null;
  userId?: string | null;
  viewedAt?: Date | null;
  dismissedAt?: Date | null;
  clickedAt?: Date | null;
}

export const BroadcastDeliveryViewMetadata: GenericRecordMetadata<BroadcastDeliveryView> = {
  broadcastDeliveryId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  deviceId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  userId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  viewedAt: {
    isArray: false,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  dismissedAt: {
    isArray: false,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  clickedAt: {
    isArray: false,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  ...GenericRecordMetadataBase
};
