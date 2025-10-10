export interface ModeratorPerformance {
  userId: string;
  moderatorUsername: string;
  moderatorEmail: string;
  itemReviewsHandled: number;
  itemReviewsCompleted: number;
  itemAppealsHandled: number;
  userReviewsHandled: number;
  userReviewsCompleted: number;
  userAppealsHandled: number;
  firstActionDate: string | null;
  lastActionDate: string | null;
  totalHandled: number;
}
