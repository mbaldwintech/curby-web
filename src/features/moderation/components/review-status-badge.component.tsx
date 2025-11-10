import { Badge } from '@core/components';
import { ReviewStatus } from '@core/enumerations';
import { AlertCircle, CheckCircle, Clock, Shield } from 'lucide-react';

export const ReviewStatusBadge = ({ status }: { status: ReviewStatus }) => {
  switch (status) {
    case ReviewStatus.Pending:
      return (
        <Badge variant="warning">
          <Clock />
          Pending
        </Badge>
      );
    case ReviewStatus.AppealPending:
      return (
        <Badge variant="warning">
          <Clock />
          Appeal Pending
        </Badge>
      );
    case ReviewStatus.InReview:
      return (
        <Badge variant="secondary">
          <Shield />
          In Review
        </Badge>
      );
    case ReviewStatus.AppealInReview:
      return (
        <Badge variant="secondary">
          <Shield />
          Appeal In Review
        </Badge>
      );
    case ReviewStatus.ReviewCompleted:
      return (
        <Badge variant="default">
          <CheckCircle />
          Completed
        </Badge>
      );
    case ReviewStatus.AppealCompleted:
      return (
        <Badge variant="default">
          <CheckCircle />
          Appeal Completed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          <AlertCircle />
          {status}
        </Badge>
      );
  }
};
