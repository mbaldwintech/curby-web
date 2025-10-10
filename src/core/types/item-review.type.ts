import { GenericRecord } from '@supa/types';

export interface ItemReview extends GenericRecord {
  itemId: string;
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
  reviewOutcomeActions?: 'no_action' | 'item_removed' | 'item_restored' | 'open_user_review' | null;
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
  appealReviewOutcomeAction?: 'no_action' | 'item_restored' | 'user_warning' | null;
  appealReviewOutcomeActionTakenAt?: Date | null;
  appealReviewOutcomeComments?: string | null;
  appealReviewOutcomeMessageToUser?: string | null;
}
