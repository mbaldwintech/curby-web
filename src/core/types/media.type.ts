import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

export interface Media extends GenericRecord {
  url: string;
  filename: string;
  fileExtension: string;
  filePath: string;
  mimeType: string;
}

export const MediaMetadata: GenericRecordMetadata<Media> = {
  url: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: false
  },
  filename: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  fileExtension: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  filePath: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: false
  },
  mimeType: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  ...GenericRecordMetadataBase
};
