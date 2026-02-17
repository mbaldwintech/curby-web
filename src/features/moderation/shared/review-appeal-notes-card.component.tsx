import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Label, Textarea } from '@core/components';
import { UserRole } from '@core/enumerations';
import { ItemReviewService, UserReviewService } from '@core/services';
import { ItemReview, UserReview } from '@core/types';
import { createLogger } from '@core/utils';
import { useProfile } from '@features/users/hooks';
import { createClientService } from '@supa/utils/client';
import { Notebook } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';

const logger = createLogger('ReviewAppealNotesCard');

type ReviewType = 'item' | 'user';
type Review = ItemReview | UserReview;

export interface ReviewAppealNotesCardProps {
  reviewType: ReviewType;
  review: Review;
  onSave?: () => void;
}

export const ReviewAppealNotesCard = ({ reviewType, review, onSave }: ReviewAppealNotesCardProps) => {
  const reviewService = useRef(
    reviewType === 'item' ? createClientService(ItemReviewService) : createClientService(UserReviewService)
  ).current;
  const [appealReviewForm, setAppealReviewForm] = useState<{ appealReviewNotes: string }>({
    appealReviewNotes: review.appealReviewNotes || ''
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const isAppealReviewInProgress = useMemo(() => review?.status === 'appeal_in_review', [review]);

  const { profile } = useProfile();

  const isAppealReviewer = useMemo(() => {
    if (!review || !profile) return false;
    return review.appealReviewerId === profile.userId;
  }, [review, profile]);

  const isAdmin = useMemo(() => {
    if (!profile) return false;
    return profile.role === UserRole.Admin;
  }, [profile]);

  const disabled = useMemo(
    () => submitting || !review || !isAppealReviewInProgress || (!isAppealReviewer && !isAdmin),
    [submitting, review, isAppealReviewInProgress, isAppealReviewer, isAdmin]
  );

  const handleSaveAppealReviewNotes = useCallback(async () => {
    if (disabled) return;

    try {
      setSubmitting(true);
      await reviewService.update(review.id, { appealReviewNotes: appealReviewForm.appealReviewNotes });
      if (onSave) {
        onSave();
      }
    } catch (err) {
      logger.error('Error saving appeal review notes:', err);
      setError('Failed to save appeal review notes.');
    } finally {
      setSubmitting(false);
    }
  }, [review, appealReviewForm, onSave, reviewService, disabled]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Notebook className="h-5 w-5" />
            Appeal Review Notes
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
          Appeal Review Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <Label htmlFor="appealReviewNotes">Appeal Review Notes</Label>
        <Textarea
          id="appealReviewNotes"
          placeholder="Enter your detailed appeal review notes..."
          value={appealReviewForm.appealReviewNotes || ''}
          onChange={(e) => {
            if (disabled) return;
            setAppealReviewForm((prev) => ({ ...prev, appealReviewNotes: e.target.value }));
          }}
          rows={4}
          disabled={disabled}
        />
      </CardContent>
      <CardFooter className="flex-1 justify-end">
        <Button onClick={handleSaveAppealReviewNotes} disabled={disabled || !appealReviewForm.appealReviewNotes}>
          {submitting ? 'Saving...' : 'Save'}
        </Button>
      </CardFooter>
    </Card>
  );
};
