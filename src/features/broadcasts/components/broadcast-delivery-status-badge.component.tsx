import { Badge } from '@core/components';
import { BroadcastDeliveryStatus } from '@core/enumerations';

export const BroadcastDeliveryStatusBadge = ({ status }: { status?: BroadcastDeliveryStatus | null }) => {
  if (!status) {
    return null;
  }

  switch (status) {
    case BroadcastDeliveryStatus.Pending:
      return <Badge variant="outline">Pending</Badge>;
    case BroadcastDeliveryStatus.Processing:
      return (
        <Badge variant="outline" className="border-highlight text-highlight">
          Processing
        </Badge>
      );
    case BroadcastDeliveryStatus.Active:
      return <Badge variant="default">Active</Badge>;
    case BroadcastDeliveryStatus.Sent:
      return (
        <Badge variant="outline" className="border-primary text-primary">
          Sent
        </Badge>
      );
    case BroadcastDeliveryStatus.Canceled:
      return <Badge variant="warning">Canceled</Badge>;
    case BroadcastDeliveryStatus.Failed:
      return <Badge variant="destructive">Failed</Badge>;
    case BroadcastDeliveryStatus.Archived:
      return <Badge variant="outline">Archived</Badge>;
    default:
      return <>{status}</>;
  }
};
