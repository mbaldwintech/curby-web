import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

export interface SupportRequestMessageMedia extends GenericRecord {
  supportRequestMessageId: string;
  mediaId: string;
}

export const SupportRequestMessageMediaMetadata: GenericRecordMetadata<SupportRequestMessageMedia> = {
  supportRequestMessageId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  mediaId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  ...GenericRecordMetadataBase
};
