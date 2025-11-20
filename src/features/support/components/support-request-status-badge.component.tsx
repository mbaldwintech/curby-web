import { Badge } from '@core/components';
import { SupportRequestStatus } from '@core/enumerations';

export const SupportRequestStatusBadge = ({ status }: { status?: SupportRequestStatus | null }) => {
  if (!status) {
    return null;
  }
  switch (status) {
    case SupportRequestStatus.Open:
      return <Badge variant="secondary">Open</Badge>;
    case SupportRequestStatus.InProgress:
      return (
        <Badge variant="default" className="bg-accent2">
          In Progress
        </Badge>
      );
    case SupportRequestStatus.WaitingForUser:
      return <Badge variant="warning">Waiting For User</Badge>;
    case SupportRequestStatus.Resolved:
      return <Badge variant="default">Resolved</Badge>;
    case SupportRequestStatus.Closed:
      return <Badge variant="outline">Closed</Badge>;
    default:
      return <>{status}</>;
  }
};
