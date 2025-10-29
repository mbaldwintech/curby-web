import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

export interface PrivacyPolicyAcceptance extends GenericRecord {
  userId: string;
  privacyPolicyId: string;
  acceptedAt: Date | string;
}

export const PrivacyPolicyAcceptanceMetadata: GenericRecordMetadata<PrivacyPolicyAcceptance> = {
  userId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  privacyPolicyId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  acceptedAt: {
    isArray: false,
    isNullable: false,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  ...GenericRecordMetadataBase
};
