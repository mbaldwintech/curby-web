import { Badge } from '@core/components';
import { ItemStatus } from '@core/enumerations';

export const ItemStatusBadge = ({ status }: { status?: ItemStatus | null }) => {
  if (!status) {
    return null;
  }
  switch (status) {
    case ItemStatus.Active:
      return (
        <Badge className="bg-primary text-primary-foreground dark:bg-primary/35 dark:text-primary-foreground">
          Active
        </Badge>
      );
    case ItemStatus.Extended:
      return (
        <Badge className="bg-accent2 text-accent2-foreground dark:bg-accent2/35 dark:text-accent2-foreground">
          Extended
        </Badge>
      );
    case ItemStatus.Expired:
      return <Badge variant="secondary">Expired</Badge>;
    case ItemStatus.Removed:
      return <Badge variant="destructive">Removed</Badge>;
    case ItemStatus.UnderReview:
      return (
        <Badge className="bg-amber-200 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Under Review</Badge>
      );
    case ItemStatus.Restored:
      return (
        <Badge className="bg-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Restored</Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};
