import { Badge } from '@core/components';
import { FeedbackType } from '@core/enumerations';

export const FeedbackTypeBadge = ({ type }: { type?: FeedbackType | null }) => {
  if (!type) {
    return null;
  }
  switch (type) {
    case FeedbackType.General:
      return <Badge variant="outline">General</Badge>;
    case FeedbackType.Bug:
      return (
        <Badge
          variant="outline"
          className="text-destructive border-destructive dark:text-destructive dark:border-destructive"
        >
          Bug
        </Badge>
      );
    case FeedbackType.Feature:
      return (
        <Badge variant="outline" className="text-primary border-primary dark:text-primary dark:border-primary">
          Feature
        </Badge>
      );
    case FeedbackType.Question:
      return (
        <Badge variant="outline" className="text-highlight border-highlight dark:text-highlight dark:border-highlight">
          Question
        </Badge>
      );
    default:
      return <>{type}</>;
  }
};
