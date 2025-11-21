import { Badge } from '@core/components';
import { UserReviewAppealReviewOutcomeAction } from '@core/enumerations';

export const UserReviewAppealReviewOutcomeActionBadge = ({
  action
}: {
  action?: UserReviewAppealReviewOutcomeAction | null;
}) => {
  if (!action) {
    return null;
  }
  switch (action) {
    case UserReviewAppealReviewOutcomeAction.NoAction:
      return <Badge className="text-gray-600 bg-gray-100 px-1.5">No Action</Badge>;
    case UserReviewAppealReviewOutcomeAction.UserWarningRetracted:
      return <Badge className="text-yellow-600 bg-yellow-100 px-1.5">Warning Retracted</Badge>;
    case UserReviewAppealReviewOutcomeAction.UserSuspensionLifted:
      return <Badge className="text-green-600 bg-green-100 px-1.5">Suspension Lifted</Badge>;
    case UserReviewAppealReviewOutcomeAction.UserBanLifted:
      return <Badge className="text-purple-600 bg-purple-100 px-1.5">Ban Lifted</Badge>;
    default:
      return <>{action}</>;
  }
};
