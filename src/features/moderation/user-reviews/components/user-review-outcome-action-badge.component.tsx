import { Badge } from '@core/components';
import { UserReviewOutcomeAction } from '@core/enumerations';

export const UserReviewOutcomeActionBadge = ({ action }: { action?: UserReviewOutcomeAction | null }) => {
  if (!action) {
    return null;
  }
  switch (action) {
    case UserReviewOutcomeAction.NoAction:
      return <Badge className="text-gray-600 bg-gray-100 px-1.5">No Action</Badge>;
    case UserReviewOutcomeAction.UserWarning:
      return <Badge className="text-green-600 bg-green-100 px-1.5">Resolved</Badge>;
    case UserReviewOutcomeAction.UserSuspension:
      return <Badge className="text-red-600 bg-red-100 px-1.5">User Suspension</Badge>;
    case UserReviewOutcomeAction.UserBan:
      return <Badge className="text-purple-600 bg-purple-100 px-1.5">User Ban</Badge>;
    default:
      return <>{action}</>;
  }
};
