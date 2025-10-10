export interface TopReporter {
  userId: string;
  username: string;
  email: string;
  role: string;
  status: string;
  avatarUrl: string | null;
  totalReports: number;
  pendingReports: number;
  inReviewReports: number;
  resolvedReports: number;
  dismissedReports: number;
  reportsLast7Days: number;
  reportsLast30Days: number;
  firstReportDate: string;
  lastReportDate: string;
  accuracyPercentage: number | null;
}
