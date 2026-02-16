import { ItemReview } from '@core/types';
import { ReviewNotesCard } from '@features/moderation/shared';

export interface ItemReviewNotesCardProps {
  itemReview: ItemReview;
  onSave?: () => void;
}

export const ItemReviewNotesCard = ({ itemReview, onSave }: ItemReviewNotesCardProps) => (
  <ReviewNotesCard reviewType="item" review={itemReview} onSave={onSave} />
);
