export interface ModerationOverview {
  pendingReports: number;
  reportsInReview: number;
  activeReports: number;
  reportsLast7Days: number;
  reportsLast30Days: number;
  pendingItemReviews: number;
  itemReviewsInProgress: number;
  itemAppealsInProgress: number;
  pendingUserReviews: number;
  userReviewsInProgress: number;
  userAppealsInProgress: number;
  falseTakingsLast7Days: number;
  falseTakingsLast30Days: number;
  currentlySuspendedUsers: number;
  bannedUsers: number;
  itemsUnderReview: number;
  removedItems: number;
  restoredItems: number;
}
