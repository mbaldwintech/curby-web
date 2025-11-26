import { Badge } from '@core/components';
import { UserStatus } from '@core/enumerations';

export const UserStatusBadge = ({ status }: { status?: UserStatus | null }) => {
  if (!status) {
    return null;
  }

  switch (status) {
    case UserStatus.Active:
      return <Badge>Active</Badge>;
    case UserStatus.Suspended:
      return <Badge variant="secondary">Suspended</Badge>;
    case UserStatus.Banned:
      return <Badge variant="destructive">Banned</Badge>;
    default:
      <>{status}</>;
  }
};
