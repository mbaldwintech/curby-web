import { Badge } from '@core/components';
import { BroadcastAudience } from '@core/enumerations';

export const BroadcastAudienceBadge = ({ audience }: { audience?: BroadcastAudience | null }) => {
  if (!audience) {
    return null;
  }

  switch (audience) {
    case BroadcastAudience.All:
      return <Badge variant="outline">All</Badge>;
    case BroadcastAudience.Guest:
      return <Badge variant="outline">Guest</Badge>;
    case BroadcastAudience.Registered:
      return <Badge variant="outline">Registered</Badge>;
    case BroadcastAudience.Pro:
      return <Badge variant="outline">Pro</Badge>;
    case BroadcastAudience.Business:
      return <Badge variant="outline">Business</Badge>;
    default:
      return <>{audience}</>;
  }
};
