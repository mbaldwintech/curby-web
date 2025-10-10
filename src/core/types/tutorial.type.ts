import { GenericRecord } from '@supa/types';

export interface Tutorial extends GenericRecord {
  key: string;
  title: string;
  description?: string;
  roles: string[]; // e.g., 'unauthenticated', 'guest', 'user', 'pro-user', 'business-user'
  active: boolean;
}
