export interface ModerationTrend {
  trendDate: string;
  dailyReports: number;
  dailyItemReviews: number;
  dailyUserReviews: number;
  dailyFalseTakings: number;
  dailyItemsRemoved: number;
  dailyItemsRestored: number;
  dailyUserSuspensions: number;
  dailyUserBans: number;
  cumulativeReports: number;
}
