import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';
import { IconProps } from '../components/icon.component';
import { Condition } from './condition.type';

export interface CurbyCoinTransactionType extends GenericRecord {
  key: string;
  eventTypeId: string;
  category: string;
  recipient: string;
  sortOrder: number;
  displayName: string;
  description?: string;
  amount: number;
  iconProps?: { backgroundColor?: string } & IconProps;
  validFrom: Date | string;
  validTo?: Date | string;
  max?: number;
  maxPerDay?: number;
  condition?: Condition;
  active: boolean;
}

export const CurbyCoinTransactionTypeMetadata: GenericRecordMetadata<CurbyCoinTransactionType> = {
  key: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  eventTypeId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  category: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  recipient: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  sortOrder: {
    isArray: false,
    isNullable: false,
    type: 'number',
    searchable: false,
    sortable: true,
    filterable: true
  },
  displayName: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  description: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: false
  },
  amount: {
    isArray: false,
    isNullable: false,
    type: 'number',
    searchable: false,
    sortable: true,
    filterable: true
  },
  iconProps: {
    isArray: false,
    isNullable: true,
    type: 'json',
    searchable: false,
    sortable: false,
    filterable: false
  },
  validFrom: {
    isArray: false,
    isNullable: false,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  validTo: {
    isArray: false,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  max: {
    isArray: false,
    isNullable: true,
    type: 'number',
    searchable: false,
    sortable: true,
    filterable: true
  },
  maxPerDay: {
    isArray: false,
    isNullable: true,
    type: 'number',
    searchable: false,
    sortable: true,
    filterable: true
  },
  condition: {
    isArray: false,
    isNullable: true,
    type: 'json',
    searchable: false,
    sortable: false,
    filterable: false
  },
  active: {
    isArray: false,
    isNullable: false,
    type: 'boolean',
    searchable: false,
    sortable: true,
    filterable: true
  },
  ...GenericRecordMetadataBase
};
