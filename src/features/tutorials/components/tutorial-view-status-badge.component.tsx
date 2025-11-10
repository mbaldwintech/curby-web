import { Badge } from '@core/components';
import { TutorialViewStatus } from '@core/enumerations';

export const TutorialViewStatusBadge = ({ status }: { status?: TutorialViewStatus | null }) => {
  if (!status) {
    return null;
  }

  switch (status) {
    case TutorialViewStatus.NotStarted:
      return <Badge className="text-muted-foreground bg-muted/20">Not Started</Badge>;
    case TutorialViewStatus.Viewed:
      return <Badge variant="secondary">Viewed</Badge>;
    case TutorialViewStatus.Skipped:
      return <Badge variant="warning">Skipped</Badge>;
    case TutorialViewStatus.Completed:
      return <Badge variant="default">Completed</Badge>;
    default:
      return <>{status}</>;
  }
};
