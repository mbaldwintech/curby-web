import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

export interface SavedItem extends GenericRecord {
  userId: string;
  itemId: string;
  savedAt: Date | string;
}

export const SavedItemMetadata: GenericRecordMetadata<SavedItem> = {
  userId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  itemId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  savedAt: {
    isArray: false,
    isNullable: false,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  ...GenericRecordMetadataBase
};
