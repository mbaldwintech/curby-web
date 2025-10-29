export interface ReportedItemRecordMetadata {
  reportId: string;
  itemId: string;
  itemTitle: string;
  itemStatus: string;
  reportedBy: string;
  postedBy: string;
  reason: string | null;
  reviewId: string | null;
}

export interface ItemReviewRecordMetadata {
  reviewId: string;
  itemId: string;
  itemTitle: string;
  itemStatus: string;
  triggerType: string;
  reviewerId: string;
}

export interface UserReviewRecordMetadata {
  reviewId: string;
  userId: string;
  username: string;
  triggerType: string;
  reviewerId: string;
}

export interface ModerationQueueItem {
  queueType: 'reported_item' | 'item_review' | 'user_review';
  queueItemId: string;
  status: string;
  createdDate: string;
  lastUpdated: string;
  hoursSinceCreated: number;
  reason: string | null;
  description: string;
  metadata: ReportedItemRecordMetadata | ItemReviewRecordMetadata | UserReviewRecordMetadata;
  priority: 'high' | 'medium' | 'low';
  priorityOrder: number;
}
