import { GenericRecord } from '@supa/types';

export interface UserWarning extends GenericRecord {
  userId: string;
  warningAt: Date; // timestamp
  reason: string;
  userReviewId: string;
  acknowledgedAt?: Date | null; // timestamp
  expiresAt?: Date | null; // timestamp
}
