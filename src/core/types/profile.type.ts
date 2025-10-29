import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';
import { UserRole, UserStatus } from '../enumerations';

export interface Profile extends GenericRecord {
  userId: string;
  username: string;
  email?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  status: UserStatus;

  pushNotifications: boolean;
  emailNotifications: boolean;
  emailMarketing: boolean;
  radius: number;
  theme: 'light' | 'dark' | 'system';
}

export const ProfileMetadata: GenericRecordMetadata<Profile> = {
  userId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  username: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  email: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  avatarUrl: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: false
  },
  role: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  status: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  pushNotifications: {
    isArray: false,
    isNullable: false,
    type: 'boolean',
    searchable: false,
    sortable: true,
    filterable: true
  },
  emailNotifications: {
    isArray: false,
    isNullable: false,
    type: 'boolean',
    searchable: false,
    sortable: true,
    filterable: true
  },
  emailMarketing: {
    isArray: false,
    isNullable: false,
    type: 'boolean',
    searchable: false,
    sortable: true,
    filterable: true
  },
  radius: {
    isArray: false,
    isNullable: false,
    type: 'number',
    searchable: false,
    sortable: true,
    filterable: true
  },
  theme: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  ...GenericRecordMetadataBase
};
