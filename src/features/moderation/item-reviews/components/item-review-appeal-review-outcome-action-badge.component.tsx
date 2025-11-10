import { Badge } from '@core/components';
import { ItemReviewAppealReviewOutcomeAction } from '@core/enumerations';

export const ItemReviewAppealReviewOutcomeActionBadge = ({
  action
}: {
  action?: ItemReviewAppealReviewOutcomeAction | null;
}) => {
  if (!action) {
    return null;
  }
  switch (action) {
    case ItemReviewAppealReviewOutcomeAction.NoAction:
      return <Badge variant="outline">No Action</Badge>;
    case ItemReviewAppealReviewOutcomeAction.ItemRemovalReversed:
      return (
        <Badge variant="outline" className="text-accent border-accent dark:text-accent2 dark:border-accent2">
          Item Removal Reversed
        </Badge>
      );
    default:
      return <>{action}</>;
  }
};
