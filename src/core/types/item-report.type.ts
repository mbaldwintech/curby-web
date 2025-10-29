import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

export interface ItemReport extends GenericRecord {
  itemId: string;
  reporterId: string;
  reportedAt: Date | string;
  reason?: string | null;
  reviewId?: string | null;
}

export const ItemReportMetadata: GenericRecordMetadata<ItemReport> = {
  itemId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  reporterId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  reportedAt: {
    isArray: false,
    isNullable: false,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  reason: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  reviewId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  ...GenericRecordMetadataBase
};
