import { GenericRecord } from '@supa/types';

export interface UserReview extends GenericRecord {
  userId: string;
  status: 'pending' | 'in_review' | 'review_completed' | 'appeal_pending' | 'appeal_in_review' | 'appeal_completed';
  triggerType: 'reports' | 'auto_flag' | 'manual';
  triggerData: Record<string, unknown>;
  triggerReason?: string | null;
  reviewerId?: string | null;
  reviewStartedAt?: Date | null;
  reviewCompletedAt?: Date | null;
  reviewNotes?: string | null;
  reviewOutcome?: 'resolved' | 'dismissed' | null;
  reviewOutcomeReason?: string | null;
  reviewOutcomeActions?: 'no_action' | 'user_warning' | 'user_suspension' | 'user_ban' | null;
  reviewOutcomeActionTakenAt?: Date | null;
  reviewOutcomeComments?: string | null;
  reviewOutcomeMessageToUser?: string | null;
  appealable: boolean;
  appealDeadline?: Date | null;
  appealedBy?: string | null;
  appealReason?: string | null;
  appealedAt?: Date | null;
  appealReviewerId?: string | null;
  appealReviewStartedAt?: Date | null;
  appealReviewCompletedAt?: Date | null;
  appealReviewNotes?: string | null;
  appealReviewOutcome?: 'appeal_granted' | 'appeal_denied' | 'partial_relief' | null;
  appealReviewOutcomeReason?: string | null;
  appealReviewOutcomeAction?: 'no_action' | 'user_warning' | 'user_suspension_lifted' | 'user_ban_lifted' | null;
  appealReviewOutcomeActionTakenAt?: Date | null;
  appealReviewOutcomeComments?: string | null;
  appealReviewOutcomeMessageToUser?: string | null;
}
