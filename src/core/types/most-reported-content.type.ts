export interface MostReportedContent {
  contentType: 'item';
  contentId: string;
  contentTitle: string;
  itemType: string;
  itemStatus: string;
  posterId: string;
  posterUsername: string;
  posterEmail: string;
  totalReports: number;
  pendingReports: number;
  inReviewReports: number;
  resolvedReports: number;
  dismissedReports: number;
  firstReportedDate: string;
  lastReportedDate: string;
  contentCreatedDate: string;
}
