import { GenericRecord } from '@supa/types';
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
