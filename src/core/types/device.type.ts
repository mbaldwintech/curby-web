import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';
import { DeviceInfo } from './device-info.type';

export interface Device extends GenericRecord, DeviceInfo {
  label?: string | null; // optional for user's to label their devices

  pushToken?: string | null; // optional, only present if notifications are enabled
  pushEnabled: boolean; // default false
  tokenValid: boolean; // default true

  locationEnabled: boolean; // default true, indicates if the device is allowed to access location data
  cameraEnabled: boolean; // default true, indicates if the device is allowed to access camera
  libraryEnabled: boolean; // default true, indicates if the device is allowed to access media

  geoLocation?: string | null; // WKT format
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  } | null; // optional, parsed from geoLocation

  lastSeenAt: Date | string; // timestamp of the last time the device was seen
  lastLogin?: Date | string | null; // timestamp of the last time the user logged in from this device
  lastLogout?: Date | string | null; // timestamp of the last time the user logged out from this device
  lastPushSentAt?: Date | string | null; // timestamp of the last push notification sent to this device
}

export const DeviceMetadata: GenericRecordMetadata<Device> = {
  deviceId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  type: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  deviceName: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  platform: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  appVersion: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  osVersion: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  label: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  pushToken: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: false
  },
  pushEnabled: {
    isArray: false,
    isNullable: false,
    type: 'boolean',
    searchable: false,
    sortable: true,
    filterable: true
  },
  tokenValid: {
    isArray: false,
    isNullable: false,
    type: 'boolean',
    searchable: false,
    sortable: true,
    filterable: true
  },
  locationEnabled: {
    isArray: false,
    isNullable: false,
    type: 'boolean',
    searchable: false,
    sortable: true,
    filterable: true
  },
  cameraEnabled: {
    isArray: false,
    isNullable: false,
    type: 'boolean',
    searchable: false,
    sortable: true,
    filterable: true
  },
  libraryEnabled: {
    isArray: false,
    isNullable: false,
    type: 'boolean',
    searchable: false,
    sortable: true,
    filterable: true
  },
  geoLocation: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  location: {
    isArray: false,
    isNullable: true,
    type: 'json',
    searchable: false,
    sortable: false,
    filterable: false
  },
  lastSeenAt: {
    isArray: false,
    isNullable: false,
    type: 'date',
    searchable: false,
    sortable: true,
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
  lastPushSentAt: {
    isArray: false,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  ...GenericRecordMetadataBase
};
