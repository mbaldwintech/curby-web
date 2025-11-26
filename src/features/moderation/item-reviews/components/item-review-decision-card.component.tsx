import { Button, Skeleton } from '@core/components';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@core/components/base/card';
import { Input } from '@core/components/base/input';
import { Label } from '@core/components/base/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@core/components/base/select';
import { Separator } from '@core/components/base/separator';
import { Textarea } from '@core/components/base/textarea';
import {
  EventTypeKey,
  ItemReviewOutcomeAction,
  ReviewOutcome,
  ReviewStatus,
  ReviewTriggerType,
  UserRole
} from '@core/enumerations';
import { EventLoggerService, ItemReviewService, ItemService, UserReviewService } from '@core/services';
import { ItemReview } from '@core/types';
import { useProfile } from '@features/users/hooks';
import { createClientService } from '@supa/utils/client';
import { useCallback, useMemo, useRef, useState } from 'react';

interface ReviewFormProps {
  itemReview: ItemReview;
  onSave?: () => void;
}

export function ItemReviewDecisionCard({ itemReview, onSave }: ReviewFormProps) {
  const itemReviewService = useRef(createClientService(ItemReviewService)).current;
  const userReviewService = useRef(createClientService(UserReviewService)).current;
  const itemService = useRef(createClientService(ItemService)).current;
  const eventLoggerService = useRef(createClientService(EventLoggerService)).current;
  const [itemReviewForm, setItemReviewForm] = useState<Partial<ItemReview>>({
    reviewOutcome: itemReview.reviewOutcome || null,
    reviewOutcomeReason: itemReview.reviewOutcomeReason || '',
    reviewOutcomeAction: itemReview.reviewOutcomeAction || null,
    reviewOutcomeComments: itemReview.reviewOutcomeComments || '',
    reviewOutcomeMessageToUser: itemReview.reviewOutcomeMessageToUser || '',
    reviewOutcomeOpenUserReview: itemReview.reviewOutcomeOpenUserReview || false,
    appealable: itemReview.appealable,
    appealDeadline: (itemReview.appealDeadline
      ? new Date(itemReview.appealDeadline).toISOString().split('T')[0]
      : '') as unknown as Date | null
  });
  const isDirty = useMemo(() => {
    return (
      itemReviewForm.reviewOutcome !== itemReview.reviewOutcome ||
      itemReviewForm.reviewOutcomeReason !== itemReview.reviewOutcomeReason ||
      itemReviewForm.reviewOutcomeAction !== itemReview.reviewOutcomeAction ||
      itemReviewForm.reviewOutcomeComments !== itemReview.reviewOutcomeComments ||
      itemReviewForm.reviewOutcomeMessageToUser !== itemReview.reviewOutcomeMessageToUser ||
      itemReviewForm.reviewOutcomeOpenUserReview !== itemReview.reviewOutcomeOpenUserReview ||
      itemReviewForm.appealable !== itemReview.appealable ||
      itemReviewForm.appealDeadline !==
        ((itemReview.appealDeadline
          ? new Date(itemReview.appealDeadline).toISOString().split('T')[0]
          : '') as unknown as Date | null)
    );
  }, [itemReviewForm, itemReview]);
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

  const onChange = useCallback(
    <K extends keyof ItemReview>(value: ItemReview[K], field: K) => {
      if (disabled) return;
      setItemReviewForm((prev) => ({ ...prev, [field]: value }));
    },
    [disabled]
  );

  const onSubmit = useCallback(async () => {
    if (disabled) return;

    try {
      setSubmitting(true);
      setError(null);

      // Apply specified action
      if (itemReviewForm.reviewOutcomeAction === ItemReviewOutcomeAction.ItemRemoved) {
        await itemService.removeItem(itemReview.itemId);
        await eventLoggerService.log(EventTypeKey.ReportedFreeItemRemoved, { itemId: itemReview.itemId });
      } else if (itemReviewForm.reviewOutcomeAction === ItemReviewOutcomeAction.ItemRestored) {
        await itemService.restoreItem(itemReview.itemId);
        await eventLoggerService.log(EventTypeKey.ReportedFreeItemRestored, { itemId: itemReview.itemId });
      }

      if (itemReviewForm.reviewOutcomeOpenUserReview) {
        const item = await itemService.getById(itemReview.itemId);
        await userReviewService.create({
          userId: item.postedBy,
          triggerType: ReviewTriggerType.Manual,
          triggerReason: itemReviewForm.reviewOutcomeReason || 'Manual review initiated by moderator',
          triggerData: {
            itemId: item.id,
            itemReviewId: itemReview.id
          },
          status: ReviewStatus.Pending,
          appealable: true
        });
      }

      // Update the review record
      await itemReviewService.update(itemReview.id, {
        status: ReviewStatus.ReviewCompleted,
        reviewCompletedAt: new Date(),
        reviewOutcome: itemReviewForm.reviewOutcome,
        reviewOutcomeReason: itemReviewForm.reviewOutcomeReason,
        reviewOutcomeAction: itemReviewForm.reviewOutcomeAction,
        reviewOutcomeActionTakenAt: new Date(),
        reviewOutcomeComments: itemReviewForm.reviewOutcomeComments,
        reviewOutcomeMessageToUser: itemReviewForm.reviewOutcomeMessageToUser,
        reviewOutcomeOpenUserReview: itemReviewForm.reviewOutcomeOpenUserReview,
        appealable: itemReviewForm.appealable,
        appealDeadline: itemReviewForm.appealable ? itemReviewForm.appealDeadline : null
      });
      if (onSave) {
        onSave();
      }
    } catch (err) {
      console.error('Error submitting review form:', err);
      setError('Failed to submit review form.');
    } finally {
      setSubmitting(false);
    }
  }, [
    itemReview,
    disabled,
    itemReviewForm,
    onSave,
    itemReviewService,
    itemService,
    userReviewService,
    eventLoggerService
  ]);

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
              value={itemReviewForm.reviewOutcome || ''}
              onValueChange={(value) => onChange(value as ReviewOutcome, 'reviewOutcome')}
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
              value={itemReviewForm.reviewOutcomeReason ?? ''}
              onChange={(e) => onChange(e.target.value, 'reviewOutcomeReason')}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:gap-4">
          <div className="space-y-1 min-w-[200px]">
            <Label htmlFor="reviewOutcomeAction">Action to Take *</Label>
            <Select
              value={itemReviewForm.reviewOutcomeAction || ''}
              onValueChange={(value) => onChange(value as ItemReviewOutcomeAction, 'reviewOutcomeAction')}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select action..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ItemReviewOutcomeAction.ItemRemoved}>Remove Item</SelectItem>
                <SelectItem value={ItemReviewOutcomeAction.ItemRestored}>Restore Item</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 w-full">
            <Label htmlFor="reviewOutcomeComments">Internal Comments</Label>
            <Textarea
              id="reviewOutcomeComments"
              placeholder="Internal comments for other reviewers..."
              value={itemReviewForm.reviewOutcomeComments || ''}
              onChange={(e) => onChange(e.target.value, 'reviewOutcomeComments')}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="reviewOutcomeMessageToUser">Message to User</Label>
          <Textarea
            id="reviewOutcomeMessageToUser"
            placeholder="Message that will be sent to the user..."
            value={itemReviewForm.reviewOutcomeMessageToUser || ''}
            onChange={(e) => onChange(e.target.value, 'reviewOutcomeMessageToUser')}
            rows={3}
            disabled={disabled}
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="reviewOutcomeOpenUserReview"
            checked={itemReviewForm.reviewOutcomeOpenUserReview || false}
            onChange={(e) => onChange(e.target.checked, 'reviewOutcomeOpenUserReview')}
            disabled={disabled}
            className="rounded border-gray-300"
          />
          <Label htmlFor="reviewOutcomeOpenUserReview">Open User Review for Item Poster</Label>
        </div>
        <Separator />
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="appealable"
              checked={itemReviewForm.appealable}
              onChange={(e) => onChange(e.target.checked, 'appealable')}
              disabled={disabled}
              className="rounded border-gray-300"
            />
            <Label htmlFor="appealable">Allow Appeal</Label>
          </div>
          {itemReviewForm.appealable && (
            <div className="space-y-1">
              <Label htmlFor="appealDeadline">Appeal Deadline</Label>
              <Input
                id="appealDeadline"
                type="date"
                value={(itemReviewForm.appealDeadline as unknown as string) || ''}
                onChange={(e) => onChange(e.target.value as unknown as Date, 'appealDeadline')}
                disabled={disabled}
              />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex-1 justify-end">
        <Button
          onClick={onSubmit}
          disabled={!isDirty || disabled || !itemReviewForm.reviewOutcome || !itemReviewForm.reviewOutcomeAction}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </CardFooter>
    </Card>
  );
}
