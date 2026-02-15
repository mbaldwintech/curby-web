import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Label, Textarea } from '@core/components';
import { ReviewStatus, UserRole } from '@core/enumerations';
import { UserReviewService } from '@core/services';
import { UserReview } from '@core/types';
import { useProfile } from '@features/users/hooks';
import { createClientService } from '@supa/utils/client';
import { Notebook } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { createLogger } from '@core/utils';

const logger = createLogger('UserReviewNotesCard');

export interface UserReviewNotesCardProps {
  userReview: UserReview;
  onSave?: () => void;
}

export const UserReviewNotesCard = ({ userReview, onSave }: UserReviewNotesCardProps) => {
  const userReviewService = useRef(createClientService(UserReviewService)).current;
  const [reviewForm, setReviewForm] = useState<Partial<UserReview>>({ reviewNotes: userReview.reviewNotes || '' });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const isReviewInProgress = useMemo(() => userReview?.status === ReviewStatus.InReview, [userReview]);

  const { profile } = useProfile();

  const isReviewer = useMemo(() => {
    if (!userReview || !profile) return false;
    return userReview.reviewerId === profile.userId;
  }, [userReview, profile]);

  const isAdmin = useMemo(() => {
    if (!profile) return false;
    return profile.role === UserRole.Admin;
  }, [profile]);

  const disabled = useMemo(
    () => submitting || !userReview || !isReviewInProgress || (!isReviewer && !isAdmin),
    [submitting, userReview, isReviewInProgress, isReviewer, isAdmin]
  );

  const handleSaveReviewNotes = useCallback(async () => {
    if (disabled) return;

    try {
      setSubmitting(true);
      await userReviewService.update(userReview.id, { reviewNotes: reviewForm.reviewNotes });
      if (onSave) {
        onSave();
      }
    } catch (err) {
      logger.error('Error saving review notes:', err);
      setError('Failed to save review notes.');
    } finally {
      setSubmitting(false);
    }
  }, [userReview, reviewForm, userReviewService, onSave, disabled]);

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
