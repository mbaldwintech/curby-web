import { Badge } from '@core/components';
import { AppealReviewOutcome } from '@core/enumerations';

export const AppealReviewOutcomeBadge = ({ outcome }: { outcome?: AppealReviewOutcome | null }) => {
  if (!outcome) {
    return null;
  }
  switch (outcome) {
    case AppealReviewOutcome.AppealGranted:
      return <Badge variant="default">Appeal Granted</Badge>;
    case AppealReviewOutcome.AppealDenied:
      return <Badge variant="destructive">Appeal Denied</Badge>;
    case AppealReviewOutcome.PartialRelief:
      return <Badge variant="secondary">Partial Relief</Badge>;
    default:
      return <>{outcome}</>;
  }
};
