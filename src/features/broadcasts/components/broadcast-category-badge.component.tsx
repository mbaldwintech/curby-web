import { Badge } from '@core/components';
import { BroadcastCategory } from '@core/enumerations';

export const BroadcastCategoryBadge = ({ category }: { category?: BroadcastCategory | null }) => {
  if (!category) {
    return null;
  }

  switch (category) {
    case BroadcastCategory.General:
      return (
        <Badge variant="outline" className="border-primary text-primary">
          General
        </Badge>
      );
    case BroadcastCategory.Promo:
      return (
        <Badge variant="outline" className="border-pink-500 text-pink-500">
          Promo
        </Badge>
      );
    case BroadcastCategory.System:
      return (
        <Badge variant="outline" className="border-highlight text-highlight">
          System
        </Badge>
      );
    case BroadcastCategory.MOTD:
      return (
        <Badge variant="outline" className="border-accent text-accent">
          MOTD
        </Badge>
      );
    case BroadcastCategory.Event:
      return (
        <Badge variant="outline" className="border-accent2 text-accent2">
          Event
        </Badge>
      );
    case BroadcastCategory.ProFeature:
      return (
        <Badge variant="outline" className="border-secondary text-secondary">
          Pro Feature
        </Badge>
      );
    default:
      return <>{category}</>;
  }
};
