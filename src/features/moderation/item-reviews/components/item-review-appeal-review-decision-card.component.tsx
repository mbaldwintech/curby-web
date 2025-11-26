import { Button, Skeleton } from '@core/components';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@core/components/base/card';
import { Label } from '@core/components/base/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@core/components/base/select';
import { Separator } from '@core/components/base/separator';
import { Textarea } from '@core/components/base/textarea';
import {
  AppealReviewOutcome,
  EventTypeKey,
  ItemReviewAppealReviewOutcomeAction,
  ReviewStatus,
  UserRole
} from '@core/enumerations';
import { EventLoggerService, ItemReviewService, ItemService } from '@core/services';
import { ItemReview } from '@core/types';
import { useProfile } from '@features/users/hooks';
import { createClientService } from '@supa/utils/client';
import { useCallback, useMemo, useRef, useState } from 'react';

interface ItemReviewAppealReviewDecisionCardProps {
  itemReview: ItemReview;
  onSave?: () => void;
}

export function ItemReviewAppealReviewDecisionCard({ itemReview, onSave }: ItemReviewAppealReviewDecisionCardProps) {
  const itemReviewService = useRef(createClientService(ItemReviewService)).current;
  const itemService = useRef(createClientService(ItemService)).current;
  const eventLoggerService = useRef(createClientService(EventLoggerService)).current;
  const [appealForm, setAppealForm] = useState<Partial<ItemReview>>({
    appealReviewOutcome: itemReview.appealReviewOutcome ?? null,
    appealReviewOutcomeReason: itemReview.appealReviewOutcomeReason || '',
    appealReviewOutcomeAction: itemReview.appealReviewOutcomeAction ?? null,
    appealReviewOutcomeComments: itemReview.appealReviewOutcomeComments || '',
    appealReviewOutcomeMessageToUser: itemReview.appealReviewOutcomeMessageToUser || ''
  });
  const isDirty = useMemo(() => {
    return (
      appealForm.appealReviewOutcome !== itemReview.appealReviewOutcome ||
      appealForm.appealReviewOutcomeReason !== itemReview.appealReviewOutcomeReason ||
      appealForm.appealReviewOutcomeAction !== itemReview.appealReviewOutcomeAction ||
      appealForm.appealReviewOutcomeComments !== itemReview.appealReviewOutcomeComments ||
      appealForm.appealReviewOutcomeMessageToUser !== itemReview.appealReviewOutcomeMessageToUser
    );
  }, [appealForm, itemReview]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const isAppealReviewInProgress = useMemo(() => itemReview?.status === ReviewStatus.AppealInReview, [itemReview]);

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

  const onChange = useCallback(
    <K extends keyof ItemReview>(value: ItemReview[K], field: K) => {
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

      if (appealForm.appealReviewOutcomeAction === ItemReviewAppealReviewOutcomeAction.ItemRemovalReversed) {
        await itemService.restoreItem(itemReview.itemId);
        await eventLoggerService.log(EventTypeKey.ReportedFreeItemRemovalReversed, { itemId: itemReview.itemId });
      }

      await itemReviewService.update(itemReview.id, {
        status: ReviewStatus.AppealCompleted,
        appealReviewCompletedAt: new Date(),
        appealReviewOutcome: appealForm.appealReviewOutcome ?? null,
        appealReviewOutcomeReason: appealForm.appealReviewOutcomeReason,
        appealReviewOutcomeAction: appealForm.appealReviewOutcomeAction ?? null,
        appealReviewOutcomeActionTakenAt: new Date(),
        appealReviewOutcomeComments: appealForm.appealReviewOutcomeComments,
        appealReviewOutcomeMessageToUser: appealForm.appealReviewOutcomeMessageToUser
      });
      if (onSave) {
        onSave();
      }
    } catch (err) {
      console.error('Error submitting appeal review form:', err);
      setError('Failed to submit appeal review form.');
    } finally {
      setSubmitting(false);
    }
  }, [itemReview, appealForm, onSave, itemReviewService, disabled, itemService, eventLoggerService]);

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
              onValueChange={(value) => onChange(value as AppealReviewOutcome, 'appealReviewOutcome')}
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
              onChange={(e) => onChange(e.target.value, 'appealReviewOutcomeReason')}
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
              onValueChange={(value) =>
                onChange(value as ItemReviewAppealReviewOutcomeAction, 'appealReviewOutcomeAction')
              }
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select appeal action..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ItemReviewAppealReviewOutcomeAction.NoAction}>No Action Required</SelectItem>
                <SelectItem value={ItemReviewAppealReviewOutcomeAction.ItemRemovalReversed}>Restore Item</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 w-full">
            <Label htmlFor="appealReviewOutcomeComments">Internal Appeal Comments</Label>
            <Textarea
              id="appealReviewOutcomeComments"
              placeholder="Internal comments for other reviewers..."
              value={appealForm.appealReviewOutcomeComments || ''}
              onChange={(e) => onChange(e.target.value, 'appealReviewOutcomeComments')}
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
            onChange={(e) => onChange(e.target.value, 'appealReviewOutcomeMessageToUser')}
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
