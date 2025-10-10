import { GenericRecord } from '@supa/types';

export interface TermsAndConditionsAcceptance extends GenericRecord {
  userId: string;
  termsAndConditionsId: string;
  acceptedAt: Date | string;
}
