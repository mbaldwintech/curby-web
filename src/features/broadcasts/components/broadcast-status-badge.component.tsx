import { Badge } from '@core/components';
import { BroadcastStatus } from '@core/enumerations';

export const BroadcastStatusBadge = ({ status }: { status?: BroadcastStatus | null }) => {
  if (!status) {
    return null;
  }

  switch (status) {
    case BroadcastStatus.Draft:
      return <Badge variant="secondary">Draft</Badge>;
    case BroadcastStatus.Active:
      return <Badge variant="default">Active</Badge>;
    case BroadcastStatus.Archived:
      return <Badge variant="destructive">Archived</Badge>;
    default:
      return <>{status}</>;
  }
};
