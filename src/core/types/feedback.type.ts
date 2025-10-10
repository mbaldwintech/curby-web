import { GenericRecord } from '@supa/types';

export interface Feedback extends GenericRecord {
  userId?: string;
  message: string;
  type?: string; // default 'general', -- e.g., 'bug', 'feature', 'question'
  resolved: boolean; // default false
}
