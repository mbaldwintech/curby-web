import { ItemReview } from '@core/types';
import { ReviewAppealNotesCard } from '@features/moderation/shared';

export interface ItemReviewAppealReviewNotesCardProps {
  itemReview: ItemReview;
  onSave?: () => void;
}

export const ItemReviewAppealReviewNotesCard = ({ itemReview, onSave }: ItemReviewAppealReviewNotesCardProps) => (
  <ReviewAppealNotesCard reviewType="item" review={itemReview} onSave={onSave} />
);
