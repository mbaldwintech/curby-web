import { SupportRequestMessageSenderType, SupportRequestMessageType } from '@core/enumerations';
import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

export interface SupportRequestMessage extends GenericRecord {
  supportRequestId: string;
  senderId?: string | null;
  senderType: SupportRequestMessageSenderType;
  message: string;
  messageType: SupportRequestMessageType;
  isInternal: boolean;
}

export const SupportRequestMessageMetadata: GenericRecordMetadata<SupportRequestMessage> = {
  supportRequestId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  senderId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  senderType: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  message: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: false,
    filterable: false
  },
  messageType: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  isInternal: {
    isArray: false,
    isNullable: false,
    type: 'boolean',
    searchable: false,
    sortable: true,
    filterable: true
  },
  ...GenericRecordMetadataBase
};
