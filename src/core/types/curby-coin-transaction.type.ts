import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

export interface CurbyCoinTransaction extends GenericRecord {
  userId: string;
  curbyCoinTransactionTypeId: string;
  eventId: string;
  amount: number;
  balanceAfter: number;
  description: string;
  occurredAt: Date | string;
}

export const CurbyCoinTransactionMetadata: GenericRecordMetadata<CurbyCoinTransaction> = {
  userId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  curbyCoinTransactionTypeId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  eventId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  amount: {
    isArray: false,
    isNullable: false,
    type: 'number',
    searchable: false,
    sortable: true,
    filterable: true
  },
  balanceAfter: {
    isArray: false,
    isNullable: false,
    type: 'number',
    searchable: false,
    sortable: true,
    filterable: true
  },
  description: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  occurredAt: {
    isArray: false,
    isNullable: false,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  ...GenericRecordMetadataBase
};
