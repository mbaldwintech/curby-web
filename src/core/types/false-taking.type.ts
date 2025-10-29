import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

export interface FalseTaking extends GenericRecord {
  takerId: string;
  itemId: string;
  takenAt: Date | string;
  restoredAt: Date | string;
}

export const FalseTakingMetadata: GenericRecordMetadata<FalseTaking> = {
  takerId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  itemId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  takenAt: {
    isArray: false,
    isNullable: false,
    type: 'timestamp',
    searchable: false,
    sortable: true,
    filterable: true
  },
  restoredAt: {
    isArray: false,
    isNullable: true,
    type: 'timestamp',
    searchable: false,
    sortable: true,
    filterable: true
  },
  ...GenericRecordMetadataBase
};
