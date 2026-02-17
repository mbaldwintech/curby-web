import { UserReview } from '@core/types';
import { ReviewNotesCard } from '@features/moderation/shared';

export interface UserReviewNotesCardProps {
  userReview: UserReview;
  onSave?: () => void;
}

export const UserReviewNotesCard = ({ userReview, onSave }: UserReviewNotesCardProps) => (
  <ReviewNotesCard reviewType="user" review={userReview} onSave={onSave} />
);
