import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

export interface UserDevice extends GenericRecord {
  userId: string;
  deviceId: string;
  lastLogin?: Date | null;
  lastLogout?: Date | null;
  lastSeenAt?: Date | null;
  forceLogout?: boolean | null;
  active: boolean;
}

export const UserDeviceMetadata: GenericRecordMetadata<UserDevice> = {
  userId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  deviceId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  lastLogin: {
    isArray: false,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  lastLogout: {
    isArray: false,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  lastSeenAt: {
    isArray: false,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  forceLogout: {
    isArray: false,
    isNullable: true,
    type: 'boolean',
    searchable: false,
    sortable: true,
    filterable: true
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
