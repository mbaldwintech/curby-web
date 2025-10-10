export interface FrequentFalseTaker {
  userId: string;
  username: string;
  email: string;
  role: string;
  status: string;
  avatarUrl: string | null;
  totalFalseTakings: number;
  falseTakingsLast7Days: number;
  falseTakingsLast30Days: number;
  firstFalseTakingDate: string;
  lastFalseTakingDate: string;
  avgDaysBetweenFalseTakings: number | null;
}
