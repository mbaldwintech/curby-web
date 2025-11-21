import { Badge } from '@core/components';
import { ReviewOutcome } from '@core/enumerations';

export const ReviewOutcomeBadge = ({ outcome }: { outcome?: ReviewOutcome | null }) => {
  if (!outcome) {
    return null;
  }
  switch (outcome) {
    case ReviewOutcome.Dismissed:
      return <Badge variant="secondary">Dismissed</Badge>;
    case ReviewOutcome.Resolved:
      return <Badge variant="default">Resolved</Badge>;
    default:
      return <>{outcome}</>;
  }
};
