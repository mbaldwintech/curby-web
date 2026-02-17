import { Button, Skeleton } from '@core/components';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@core/components/base/card';
import { Input } from '@core/components/base/input';
import { Label } from '@core/components/base/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@core/components/base/select';
import { Separator } from '@core/components/base/separator';
import { Textarea } from '@core/components/base/textarea';
import { ReviewOutcome, ReviewStatus, UserRole } from '@core/enumerations';
import { ItemReview, UserReview } from '@core/types';
import { createLogger } from '@core/utils';
import { useProfile } from '@features/users/hooks';
import { ReactNode, useCallback, useMemo, useState } from 'react';

const logger = createLogger('ReviewDecisionCard');

type Review = ItemReview | UserReview;

export interface ReviewDecisionFormState {
  reviewOutcome: ReviewOutcome | null;
  reviewOutcomeReason: string;
  reviewOutcomeAction: string | null;
  reviewOutcomeComments: string;
  reviewOutcomeMessageToUser: string;
  appealable: boolean;
  appealDeadline: string;
  /** Item-review only: whether to open a user review for the item poster */
  reviewOutcomeOpenUserReview?: boolean;
}

export interface ActionOption {
  value: string;
  label: string;
}

export interface ReviewDecisionCardProps {
  review: Review;
  actionOptions: ActionOption[];
  onSubmitAction: (form: ReviewDecisionFormState) => Promise<void>;
  onSave?: () => void;
  renderExtraFields?: (
    form: ReviewDecisionFormState,
    onChange: (field: keyof ReviewDecisionFormState, value: unknown) => void,
    disabled: boolean
  ) => ReactNode;
  isFormValid?: (form: ReviewDecisionFormState) => boolean;
  isFormDirty?: (form: ReviewDecisionFormState) => boolean;
}

export function ReviewDecisionCard({
  review,
  actionOptions,
  onSubmitAction,
  onSave,
  renderExtraFields,
  isFormValid: isFormValidProp,
  isFormDirty: isFormDirtyProp
}: ReviewDecisionCardProps) {
  const [form, setForm] = useState<ReviewDecisionFormState>({
    reviewOutcome: (review.reviewOutcome as ReviewOutcome) || null,
    reviewOutcomeReason: review.reviewOutcomeReason || '',
    reviewOutcomeAction: (review.reviewOutcomeAction as string) || null,
    reviewOutcomeComments: review.reviewOutcomeComments || '',
    reviewOutcomeMessageToUser: review.reviewOutcomeMessageToUser || '',
    appealable: review.appealable,
    appealDeadline: review.appealDeadline ? new Date(review.appealDeadline).toISOString().split('T')[0] : '',
    reviewOutcomeOpenUserReview:
      'reviewOutcomeOpenUserReview' in review ? (review as ItemReview).reviewOutcomeOpenUserReview || false : false
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

  const isDirty = useMemo(() => {
    if (isFormDirtyProp) return isFormDirtyProp(form);
    return (
      form.reviewOutcome !== ((review.reviewOutcome as ReviewOutcome) || null) ||
      form.reviewOutcomeReason !== (review.reviewOutcomeReason || '') ||
      form.reviewOutcomeAction !== ((review.reviewOutcomeAction as string) || null) ||
      form.reviewOutcomeComments !== (review.reviewOutcomeComments || '') ||
      form.reviewOutcomeMessageToUser !== (review.reviewOutcomeMessageToUser || '') ||
      form.appealable !== review.appealable ||
      form.appealDeadline !== (review.appealDeadline ? new Date(review.appealDeadline).toISOString().split('T')[0] : '')
    );
  }, [form, review, isFormDirtyProp]);

  const isValid = useMemo(() => {
    if (isFormValidProp) return isFormValidProp(form);
    return !!form.reviewOutcome && !!form.reviewOutcomeAction;
  }, [form, isFormValidProp]);

  const onChange = useCallback(
    (field: keyof ReviewDecisionFormState, value: unknown) => {
      if (disabled) return;
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [disabled]
  );

  const onSubmit = useCallback(async () => {
    if (disabled || !isValid) return;

    try {
      setSubmitting(true);
      setError(null);
      await onSubmitAction(form);
      if (onSave) {
        onSave();
      }
    } catch (err) {
      logger.error('Error submitting review form:', err);
      setError('Failed to submit review form.');
    } finally {
      setSubmitting(false);
    }
  }, [disabled, isValid, form, onSubmitAction, onSave]);

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
        <CardTitle className="flex items-center gap-2">Review Decision</CardTitle>
        <CardDescription>Complete your review and decide on the appropriate action.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row md:gap-4">
          <div className="space-y-1 min-w-[200px]">
            <Label htmlFor="reviewOutcome">Review Outcome *</Label>
            <Select
              value={form.reviewOutcome || ''}
              onValueChange={(value) => onChange('reviewOutcome', value as ReviewOutcome)}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select outcome..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ReviewOutcome.Resolved}>Resolved - Issue Found</SelectItem>
                <SelectItem value={ReviewOutcome.Dismissed}>Dismissed - No Issue Found</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 w-full">
            <Label htmlFor="reviewOutcomeReason">Outcome Reason *</Label>
            <Textarea
              id="reviewOutcomeReason"
              placeholder="Brief reason for your decision..."
              value={form.reviewOutcomeReason ?? ''}
              onChange={(e) => onChange('reviewOutcomeReason', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:gap-4">
          <div className="space-y-1 min-w-[200px]">
            <Label htmlFor="reviewOutcomeAction">Action to Take *</Label>
            <Select
              value={form.reviewOutcomeAction || ''}
              onValueChange={(value) => onChange('reviewOutcomeAction', value)}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select action..." />
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
            <Label htmlFor="reviewOutcomeComments">Internal Comments</Label>
            <Textarea
              id="reviewOutcomeComments"
              placeholder="Internal comments for other reviewers..."
              value={form.reviewOutcomeComments || ''}
              onChange={(e) => onChange('reviewOutcomeComments', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
        {renderExtraFields && renderExtraFields(form, onChange, disabled)}
        <div className="space-y-1">
          <Label htmlFor="reviewOutcomeMessageToUser">Message to User</Label>
          <Textarea
            id="reviewOutcomeMessageToUser"
            placeholder="Message that will be sent to the user..."
            value={form.reviewOutcomeMessageToUser || ''}
            onChange={(e) => onChange('reviewOutcomeMessageToUser', e.target.value)}
            rows={3}
            disabled={disabled}
          />
        </div>
        <Separator />
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="appealable"
              checked={form.appealable}
              onChange={(e) => onChange('appealable', e.target.checked)}
              disabled={disabled}
              className="rounded border-gray-300"
            />
            <Label htmlFor="appealable">Allow Appeal</Label>
          </div>
          {form.appealable && (
            <div className="space-y-1">
              <Label htmlFor="appealDeadline">Appeal Deadline</Label>
              <Input
                id="appealDeadline"
                type="date"
                value={form.appealDeadline || ''}
                onChange={(e) => onChange('appealDeadline', e.target.value)}
                disabled={disabled}
              />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex-1 justify-end">
        <Button onClick={onSubmit} disabled={!isDirty || disabled || !isValid}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </CardFooter>
    </Card>
  );
}
