import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Label, Textarea } from '@core/components';
import { ReviewStatus, UserRole } from '@core/enumerations';
import { ItemReviewService, UserReviewService } from '@core/services';
import { ItemReview, UserReview } from '@core/types';
import { createLogger } from '@core/utils';
import { useProfile } from '@features/users/hooks';
import { createClientService } from '@supa/utils/client';
import { Notebook } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';

const logger = createLogger('ReviewNotesCard');

type ReviewType = 'item' | 'user';
type Review = ItemReview | UserReview;

export interface ReviewNotesCardProps {
  reviewType: ReviewType;
  review: Review;
  onSave?: () => void;
}

export const ReviewNotesCard = ({ reviewType, review, onSave }: ReviewNotesCardProps) => {
  const reviewService = useRef(
    reviewType === 'item' ? createClientService(ItemReviewService) : createClientService(UserReviewService)
  ).current;
  const [reviewForm, setReviewForm] = useState<{ reviewNotes: string }>({
    reviewNotes: review.reviewNotes || ''
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const isReviewInProgress = useMemo(() => review?.status === ReviewStatus.InReview, [review]);

  const { profile } = useProfile();

  const isReviewer = useMemo(() => {
    if (!review || !profile) return false;
    return review.reviewerId === profile.userId;
  }, [review, profile]);

  const isAdmin = useMemo(() => {
    if (!profile) return false;
    return profile.role === UserRole.Admin;
  }, [profile]);

  const disabled = useMemo(
    () => submitting || !review || !isReviewInProgress || (!isReviewer && !isAdmin),
    [submitting, review, isReviewInProgress, isReviewer, isAdmin]
  );

  const handleSaveReviewNotes = useCallback(async () => {
    if (disabled) return;

    try {
      setSubmitting(true);
      await reviewService.update(review.id, { reviewNotes: reviewForm.reviewNotes });
      if (onSave) {
        onSave();
      }
    } catch (err) {
      logger.error('Error saving review notes:', err);
      setError('Failed to save review notes.');
    } finally {
      setSubmitting(false);
    }
  }, [review, reviewForm, reviewService, onSave, disabled]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Notebook className="h-5 w-5" />
            Review Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Notebook className="h-5 w-5" />
          Review Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <Label htmlFor="reviewNotes">Review Notes</Label>
        <Textarea
          id="reviewNotes"
          placeholder="Enter your detailed review notes..."
          value={reviewForm.reviewNotes || ''}
          onChange={(e) => setReviewForm((prev) => ({ ...prev, reviewNotes: e.target.value }))}
          rows={4}
          disabled={disabled}
        />
      </CardContent>
      <CardFooter className="flex-1 justify-end">
        <Button onClick={handleSaveReviewNotes} disabled={disabled || !reviewForm.reviewNotes}>
          {submitting ? 'Saving...' : 'Save'}
        </Button>
      </CardFooter>
    </Card>
  );
};
