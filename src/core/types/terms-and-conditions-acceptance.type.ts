import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

export interface TermsAndConditionsAcceptance extends GenericRecord {
  userId: string;
  termsAndConditionsId: string;
  acceptedAt: Date | string;
}

export const TermsAndConditionsAcceptanceMetadata: GenericRecordMetadata<TermsAndConditionsAcceptance> = {
  userId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  termsAndConditionsId: {
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
