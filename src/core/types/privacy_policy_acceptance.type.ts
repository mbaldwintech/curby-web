import { GenericRecord } from '@supa/types';

export interface PrivacyPolicyAcceptance extends GenericRecord {
  userId: string;
  privacyPolicyId: string;
  acceptedAt: Date | string;
}
