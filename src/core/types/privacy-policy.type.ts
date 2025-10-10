import { GenericRecord } from '@supa/types';

export interface PrivacyPolicy extends GenericRecord {
  version: string;
  content: string;
  effectiveDate: Date | string;
}
