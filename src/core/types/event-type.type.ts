import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';
import { Condition } from './condition.type';

export interface EventType extends GenericRecord {
  key: string;
  category: string;
  name: string;
  description?: string;
  validFrom: Date | string;
  validTo?: Date | string;
  max?: number;
  maxPerDay?: number;
  condition?: Condition;
  active: boolean;
}

export const EventTypeMetadata: GenericRecordMetadata<EventType> = {
  key: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
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
  name: {
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
