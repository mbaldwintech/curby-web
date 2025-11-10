import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Label, Textarea } from '@core/components';
import { UserRole } from '@core/enumerations';
import { ItemReviewService } from '@core/services';
import { ItemReview } from '@core/types';
import { useProfile } from '@features/users/hooks';
import { createClientService } from '@supa/utils/client';
import { Notebook } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';

export interface ItemReviewAppealReviewNotesCardProps {
  itemReview: ItemReview;
  onSave?: () => void;
}

export const ItemReviewAppealReviewNotesCard = ({ itemReview, onSave }: ItemReviewAppealReviewNotesCardProps) => {
  const itemReviewService = useRef(createClientService(ItemReviewService)).current;
  const [appealReviewForm, setAppealReviewForm] = useState<Partial<ItemReview>>({
    appealReviewNotes: itemReview.appealReviewNotes || ''
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const isAppealReviewInProgress = useMemo(() => itemReview?.status === 'appeal_in_review', [itemReview]);

  const { profile } = useProfile();

  const isAppealReviewer = useMemo(() => {
    if (!itemReview || !profile) return false;
    return itemReview.appealReviewerId === profile.userId;
  }, [itemReview, profile]);

  const isAdmin = useMemo(() => {
    if (!profile) return false;
    return profile.role === UserRole.Admin;
  }, [profile]);

  const disabled = useMemo(
    () => submitting || !itemReview || !isAppealReviewInProgress || (!isAppealReviewer && !isAdmin),
    [submitting, itemReview, isAppealReviewInProgress, isAppealReviewer, isAdmin]
  );

  const handleSaveAppealReviewNotes = useCallback(async () => {
    if (disabled) return;

    try {
      setSubmitting(true);
      await itemReviewService.update(itemReview.id, { appealReviewNotes: appealReviewForm.appealReviewNotes });
      if (onSave) {
        onSave();
      }
    } catch (err) {
      console.error('Error saving appeal review notes:', err);
      setError('Failed to save appeal review notes.');
    } finally {
      setSubmitting(false);
    }
  }, [itemReview, appealReviewForm, onSave, itemReviewService, disabled]);

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
