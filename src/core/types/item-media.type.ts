import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

export interface ItemMedia extends GenericRecord {
  itemId: string;
  mediaId: string;
  thumbnailId?: string;
}

export const ItemMediaMetadata: GenericRecordMetadata<ItemMedia> = {
  itemId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  mediaId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  thumbnailId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  ...GenericRecordMetadataBase
};
