import { Badge } from '@core/components';
import { BroadcastPlatform } from '@core/enumerations';

export const BroadcastPlatformBadge = ({ platform }: { platform?: BroadcastPlatform | null }) => {
  if (!platform) {
    return null;
  }

  switch (platform) {
    case BroadcastPlatform.All:
      return <Badge variant="outline">All</Badge>;
    case BroadcastPlatform.iOS:
      return <Badge variant="outline">iOS</Badge>;
    case BroadcastPlatform.Android:
      return <Badge variant="outline">Android</Badge>;
    default:
      return <>{platform}</>;
  }
};
