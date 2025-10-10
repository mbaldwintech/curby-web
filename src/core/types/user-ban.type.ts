import { GenericRecord } from '@supa/types';

export interface UserBan extends GenericRecord {
  userId: string;
  active: boolean;
  bannedAt: Date;
  userReviewId: string;
}
