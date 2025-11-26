import { Badge } from '@core/components';
import { ItemReviewOutcomeAction } from '@core/enumerations';

export const ItemReviewOutcomeActionBadge = ({ action }: { action?: ItemReviewOutcomeAction | null }) => {
  if (!action) {
    return null;
  }
  switch (action) {
    case ItemReviewOutcomeAction.ItemRemoved:
      return (
        <Badge
          variant="outline"
          className="text-destructive border-destructive dark:text-destructive dark:border-destructive"
        >
          Item Removed
        </Badge>
      );
    case ItemReviewOutcomeAction.ItemRestored:
      return (
        <Badge variant="outline" className="text-accent border-accent dark:text-accent2 dark:border-accent2">
          Item Restored
        </Badge>
      );
    default:
      return <>{action}</>;
  }
};
