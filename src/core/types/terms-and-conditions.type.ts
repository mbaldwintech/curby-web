import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

export interface TermsAndConditions extends GenericRecord {
  version: string;
  content: string;
  effectiveDate: Date | string;
}

export const TermsAndConditionsMetadata: GenericRecordMetadata<TermsAndConditions> = {
  version: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  content: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: false,
    filterable: false
  },
  effectiveDate: {
    isArray: false,
    isNullable: false,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  ...GenericRecordMetadataBase
};
