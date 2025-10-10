import { GenericRecord } from '@supa/types';

export interface UserSuspension extends GenericRecord {
  userId: string;
  active: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  userReviewId: string;
}
