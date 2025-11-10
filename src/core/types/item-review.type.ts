import {
  AppealReviewOutcome,
  ItemReviewAppealReviewOutcomeAction,
  ItemReviewOutcomeAction,
  ReviewOutcome,
  ReviewStatus,
  ReviewTriggerType
} from '@core/enumerations';
import { GenericRecord, GenericRecordMetadata, GenericRecordMetadataBase } from '@supa/types';

export interface ItemReview extends GenericRecord {
  itemId: string;
  status: ReviewStatus;
  triggerType: ReviewTriggerType;
  triggerData: Record<string, unknown>;
  triggerReason?: string | null;
  reviewerId?: string | null;
  reviewStartedAt?: Date | null;
  reviewCompletedAt?: Date | null;
  reviewNotes?: string | null;
  reviewOutcome?: ReviewOutcome | null;
  reviewOutcomeReason?: string | null;
  reviewOutcomeAction?: ItemReviewOutcomeAction | null;
  reviewOutcomeActionTakenAt?: Date | null;
  reviewOutcomeComments?: string | null;
  reviewOutcomeMessageToUser?: string | null;
  reviewOutcomeOpenUserReview?: boolean | null;
  appealable: boolean;
  appealDeadline?: Date | null;
  appealedBy?: string | null;
  appealReason?: string | null;
  appealedAt?: Date | null;
  appealReviewerId?: string | null;
  appealReviewStartedAt?: Date | null;
  appealReviewCompletedAt?: Date | null;
  appealReviewNotes?: string | null;
  appealReviewOutcome?: AppealReviewOutcome | null;
  appealReviewOutcomeReason?: string | null;
  appealReviewOutcomeAction?: ItemReviewAppealReviewOutcomeAction | null;
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
