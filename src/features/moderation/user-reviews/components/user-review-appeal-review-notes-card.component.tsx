import { UserReview } from '@core/types';
import { ReviewAppealNotesCard } from '@features/moderation/shared';

export interface UserReviewAppealReviewNotesCardProps {
  userReview: UserReview;
  onSave?: () => void;
}

export const UserReviewAppealReviewNotesCard = ({ userReview, onSave }: UserReviewAppealReviewNotesCardProps) => (
  <ReviewAppealNotesCard reviewType="user" review={userReview} onSave={onSave} />
);
