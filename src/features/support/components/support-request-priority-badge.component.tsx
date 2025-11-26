import { Badge } from '@core/components';
import { SupportRequestPriority } from '@core/enumerations';

export const SupportRequestPriorityBadge = ({ priority }: { priority?: SupportRequestPriority | null }) => {
  if (!priority) {
    return null;
  }
  switch (priority) {
    case SupportRequestPriority.Low:
      return <Badge variant="secondary">Low</Badge>;
    case SupportRequestPriority.Normal:
      return (
        <Badge variant="default" className="bg-accent2">
          Medium
        </Badge>
      );
    case SupportRequestPriority.High:
      return <Badge variant="warning">High</Badge>;
    case SupportRequestPriority.Urgent:
      return <Badge variant="destructive">Urgent</Badge>;
    default:
      return <>{priority}</>;
  }
};
