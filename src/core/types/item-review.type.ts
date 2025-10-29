import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

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
  reviewOutcomeAction?: 'no_action' | 'item_removed' | 'item_restored' | 'open_user_review' | null;
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

export const ItemReviewMetadata: GenericRecordMetadata<ItemReview> = {
  itemId: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  status: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  triggerType: {
    isArray: false,
    isNullable: false,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  triggerData: {
    isArray: false,
    isNullable: false,
    type: 'json',
    searchable: false,
    sortable: false,
    filterable: false
  },
  triggerReason: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  reviewerId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  reviewStartedAt: {
    isArray: false,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  reviewCompletedAt: {
    isArray: false,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  reviewNotes: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  reviewOutcome: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  reviewOutcomeReason: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  reviewOutcomeAction: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  reviewOutcomeActionTakenAt: {
    isArray: false,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  reviewOutcomeComments: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  reviewOutcomeMessageToUser: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  appealable: {
    isArray: false,
    isNullable: false,
    type: 'boolean',
    searchable: false,
    sortable: true,
    filterable: true
  },
  appealDeadline: {
    isArray: false,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  appealedBy: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  appealReason: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  appealedAt: {
    isArray: false,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  appealReviewerId: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: false,
    filterable: true
  },
  appealReviewStartedAt: {
    isArray: false,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  appealReviewCompletedAt: {
    isArray: false,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  appealReviewNotes: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  appealReviewOutcome: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  appealReviewOutcomeReason: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  appealReviewOutcomeAction: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: false,
    sortable: true,
    filterable: true
  },
  appealReviewOutcomeActionTakenAt: {
    isArray: false,
    isNullable: true,
    type: 'date',
    searchable: false,
    sortable: true,
    filterable: true
  },
  appealReviewOutcomeComments: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  appealReviewOutcomeMessageToUser: {
    isArray: false,
    isNullable: true,
    type: 'string',
    searchable: true,
    sortable: true,
    filterable: true
  },
  ...GenericRecordMetadataBase
};
