import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Label, Textarea } from '@core/components';
import { ReviewStatus, UserRole } from '@core/enumerations';
import { ItemReviewService } from '@core/services';
import { ItemReview } from '@core/types';
import { useProfile } from '@features/users/hooks';
import { createClientService } from '@supa/utils/client';
import { Notebook } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { createLogger } from '@core/utils';

const logger = createLogger('ItemReviewNotesCard');

export interface ItemReviewNotesCardProps {
  itemReview: ItemReview;
  onSave?: () => void;
}

export const ItemReviewNotesCard = ({ itemReview, onSave }: ItemReviewNotesCardProps) => {
  const itemReviewService = useRef(createClientService(ItemReviewService)).current;
  const [reviewForm, setReviewForm] = useState<Partial<ItemReview>>({ reviewNotes: itemReview.reviewNotes || '' });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const isReviewInProgress = useMemo(() => itemReview?.status === ReviewStatus.InReview, [itemReview]);

  const { profile } = useProfile();

  const isReviewer = useMemo(() => {
    if (!itemReview || !profile) return false;
    return itemReview.reviewerId === profile.userId;
  }, [itemReview, profile]);

  const isAdmin = useMemo(() => {
    if (!profile) return false;
    return profile.role === UserRole.Admin;
  }, [profile]);

  const disabled = useMemo(
    () => submitting || !itemReview || !isReviewInProgress || (!isReviewer && !isAdmin),
    [submitting, itemReview, isReviewInProgress, isReviewer, isAdmin]
  );

  const handleSaveReviewNotes = useCallback(async () => {
    if (disabled) return;

    try {
      setSubmitting(true);
      await itemReviewService.update(itemReview.id, { reviewNotes: reviewForm.reviewNotes });
      if (onSave) {
        onSave();
      }
    } catch (err) {
      logger.error('Error saving review notes:', err);
      setError('Failed to save review notes.');
    } finally {
      setSubmitting(false);
    }
  }, [itemReview, reviewForm, itemReviewService, onSave, disabled]);

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
