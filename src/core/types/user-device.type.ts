import { GenericRecord } from '@supa/types';

export interface UserDevice extends GenericRecord {
  userId: string;
  deviceId: string;
  lastLogin?: Date | null;
  lastLogout?: Date | null;
  lastSeenAt?: Date | null;
  forceLogout?: boolean | null;
  active: boolean;
}
