import { Button, Skeleton } from '@core/components';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@core/components/base/card';
import { Label } from '@core/components/base/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@core/components/base/select';
import { Separator } from '@core/components/base/separator';
import { Textarea } from '@core/components/base/textarea';
import { AppealReviewOutcome, ReviewStatus, UserRole } from '@core/enumerations';
import { ItemReview, UserReview } from '@core/types';
import { createLogger } from '@core/utils';
import { useProfile } from '@features/users/hooks';
import { useCallback, useMemo, useState } from 'react';

const logger = createLogger('ReviewAppealDecisionCard');

type Review = ItemReview | UserReview;

export interface AppealDecisionFormState {
  appealReviewOutcome: AppealReviewOutcome | null;
  appealReviewOutcomeReason: string;
  appealReviewOutcomeAction: string | null;
  appealReviewOutcomeComments: string;
  appealReviewOutcomeMessageToUser: string;
}

export interface AppealActionOption {
  value: string;
  label: string;
}

export interface ReviewAppealDecisionCardProps {
  review: Review;
  actionOptions: AppealActionOption[];
  onSubmitAction: (form: AppealDecisionFormState) => Promise<void>;
  onSave?: () => void;
}

export function ReviewAppealDecisionCard({
  review,
  actionOptions,
  onSubmitAction,
  onSave
}: ReviewAppealDecisionCardProps) {
  const [appealForm, setAppealForm] = useState<AppealDecisionFormState>({
    appealReviewOutcome: (review.appealReviewOutcome as AppealReviewOutcome) ?? null,
    appealReviewOutcomeReason: review.appealReviewOutcomeReason || '',
    appealReviewOutcomeAction: (review.appealReviewOutcomeAction as string) ?? null,
    appealReviewOutcomeComments: review.appealReviewOutcomeComments || '',
    appealReviewOutcomeMessageToUser: review.appealReviewOutcomeMessageToUser || ''
  });
  const isDirty = useMemo(() => {
    return (
      appealForm.appealReviewOutcome !== ((review.appealReviewOutcome as AppealReviewOutcome) ?? null) ||
      appealForm.appealReviewOutcomeReason !== (review.appealReviewOutcomeReason || '') ||
      appealForm.appealReviewOutcomeAction !== ((review.appealReviewOutcomeAction as string) ?? null) ||
      appealForm.appealReviewOutcomeComments !== (review.appealReviewOutcomeComments || '') ||
      appealForm.appealReviewOutcomeMessageToUser !== (review.appealReviewOutcomeMessageToUser || '')
    );
  }, [appealForm, review]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const isAppealReviewInProgress = useMemo(() => review?.status === ReviewStatus.AppealInReview, [review]);

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

  const onChange = useCallback(
    (field: keyof AppealDecisionFormState, value: unknown) => {
      if (disabled) return;
      setAppealForm((prev) => ({ ...prev, [field]: value }));
    },
    [disabled]
  );

  const onSubmit = useCallback(async () => {
    if (disabled) return;

    try {
      setSubmitting(true);
      setError(null);
      await onSubmitAction(appealForm);
      if (onSave) {
        onSave();
      }
    } catch (err) {
      logger.error('Error submitting appeal review form:', err);
      setError('Failed to submit appeal review form.');
    } finally {
      setSubmitting(false);
    }
  }, [disabled, appealForm, onSubmitAction, onSave]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Appeal Review Decision</CardTitle>
        <CardDescription>Review the appeal and decide on the appropriate action.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row md:gap-4">
          <div className="space-y-1 min-w-[200px]">
            <Label htmlFor="appealReviewOutcome">Appeal Outcome *</Label>
            <Select
              value={appealForm.appealReviewOutcome ?? ''}
              onValueChange={(value) => onChange('appealReviewOutcome', value as AppealReviewOutcome)}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select appeal outcome..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AppealReviewOutcome.AppealGranted}>Appeal Granted</SelectItem>
                <SelectItem value={AppealReviewOutcome.AppealDenied}>Appeal Denied</SelectItem>
                <SelectItem value={AppealReviewOutcome.PartialRelief}>Partial Relief</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 w-full">
            <Label htmlFor="appealReviewOutcomeReason">Appeal Outcome Reason *</Label>
            <Textarea
              id="appealReviewOutcomeReason"
              placeholder="Brief reason for your appeal decision..."
              value={appealForm.appealReviewOutcomeReason || ''}
              onChange={(e) => onChange('appealReviewOutcomeReason', e.target.value)}
              rows={2}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:gap-4">
          <div className="space-y-1 min-w-[200px]">
            <Label htmlFor="appealReviewOutcomeAction">Appeal Action to Take *</Label>
            <Select
              value={appealForm.appealReviewOutcomeAction ?? ''}
              onValueChange={(value) => onChange('appealReviewOutcomeAction', value)}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select appeal action..." />
              </SelectTrigger>
              <SelectContent>
                {actionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 w-full">
            <Label htmlFor="appealReviewOutcomeComments">Internal Appeal Comments</Label>
            <Textarea
              id="appealReviewOutcomeComments"
              placeholder="Internal comments for other reviewers..."
              value={appealForm.appealReviewOutcomeComments || ''}
              onChange={(e) => onChange('appealReviewOutcomeComments', e.target.value)}
              rows={2}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="appealReviewOutcomeMessageToUser">Appeal Message to User</Label>
          <Textarea
            id="appealReviewOutcomeMessageToUser"
            placeholder="Appeal message that will be sent to the user..."
            value={appealForm.appealReviewOutcomeMessageToUser || ''}
            onChange={(e) => onChange('appealReviewOutcomeMessageToUser', e.target.value)}
            rows={3}
            disabled={disabled}
          />
        </div>
        <Separator />
      </CardContent>
      <CardFooter className="flex-1 justify-end">
        <Button
          onClick={onSubmit}
          disabled={!isDirty || disabled || !appealForm.appealReviewOutcome || !appealForm.appealReviewOutcomeAction}
        >
          {submitting ? 'Submitting...' : 'Submit Appeal Review'}
        </Button>
      </CardFooter>
    </Card>
  );
}
