export interface AutomatedModerationSummary {
  falseTakingDetections: number;
  spamPostingDetections: number;
  maliciousReportingDetections: number;
  suspiciousTakingDetections: number;
  reportBombingDetections: number;
  pendingAutomatedUserReviews: number;
  pendingAutomatedItemReviews: number;
  automatedDetectionActionRate: number | null;
}
