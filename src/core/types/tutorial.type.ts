import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

export interface Tutorial extends GenericRecord {
  key: string;
  title: string;
  description?: string;
  roles: string[]; // e.g., 'unauthenticated', 'guest', 'user', 'pro-user', 'business-user'
  active: boolean;
}

export const TutorialMetadata: GenericRecordMetadata<Tutorial> = {
  key: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  title: {
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
    sortable: false,
    filterable: false
  },
  roles: {
    isArray: true,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: false,
    filterable: true
  },
  active: {
    isArray: false,
    isNullable: false,
    type: 'boolean',
    searchable: true,
    sortable: true,
    filterable: true
  },
  ...GenericRecordMetadataBase
};
