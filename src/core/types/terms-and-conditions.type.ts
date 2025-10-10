import { GenericRecord } from '@supa/types';

export interface TermsAndConditions extends GenericRecord {
  version: string;
  content: string;
  effectiveDate: Date | string;
}
