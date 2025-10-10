import { GenericRecord } from '@supa/types';
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
