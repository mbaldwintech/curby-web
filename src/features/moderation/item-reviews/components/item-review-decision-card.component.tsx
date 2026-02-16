import { Label } from '@core/components/base/label';
import { EventTypeKey, ItemReviewOutcomeAction, ReviewStatus, ReviewTriggerType } from '@core/enumerations';
import { EventLoggerService, ItemReviewService, ItemService, UserReviewService } from '@core/services';
import { ItemReview } from '@core/types';
import { ActionOption, ReviewDecisionCard, ReviewDecisionFormState } from '@features/moderation/shared';
import { createClientService } from '@supa/utils/client';
import { useCallback, useRef } from 'react';

interface ReviewFormProps {
  itemReview: ItemReview;
  onSave?: () => void;
}

const ITEM_ACTION_OPTIONS: ActionOption[] = [
  { value: ItemReviewOutcomeAction.ItemRemoved, label: 'Remove Item' },
  { value: ItemReviewOutcomeAction.ItemRestored, label: 'Restore Item' }
];

export function ItemReviewDecisionCard({ itemReview, onSave }: ReviewFormProps) {
  const itemReviewService = useRef(createClientService(ItemReviewService)).current;
  const userReviewService = useRef(createClientService(UserReviewService)).current;
  const itemService = useRef(createClientService(ItemService)).current;
  const eventLoggerService = useRef(createClientService(EventLoggerService)).current;

  const handleSubmit = useCallback(
    async (form: ReviewDecisionFormState) => {
      // Apply specified action
      if (form.reviewOutcomeAction === ItemReviewOutcomeAction.ItemRemoved) {
        await itemService.removeItem(itemReview.itemId);
        await eventLoggerService.log(EventTypeKey.ReportedFreeItemRemoved, { itemId: itemReview.itemId });
      } else if (form.reviewOutcomeAction === ItemReviewOutcomeAction.ItemRestored) {
        await itemService.restoreItem(itemReview.itemId);
        await eventLoggerService.log(EventTypeKey.ReportedFreeItemRestored, { itemId: itemReview.itemId });
      }

      if (form.reviewOutcomeOpenUserReview) {
        const item = await itemService.getById(itemReview.itemId);
        await userReviewService.create({
          userId: item.postedBy,
          triggerType: ReviewTriggerType.Manual,
          triggerReason: form.reviewOutcomeReason || 'Manual review initiated by moderator',
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
        reviewOutcome: form.reviewOutcome,
        reviewOutcomeReason: form.reviewOutcomeReason,
        reviewOutcomeAction: form.reviewOutcomeAction as ItemReviewOutcomeAction,
        reviewOutcomeActionTakenAt: new Date(),
        reviewOutcomeComments: form.reviewOutcomeComments,
        reviewOutcomeMessageToUser: form.reviewOutcomeMessageToUser,
        reviewOutcomeOpenUserReview: form.reviewOutcomeOpenUserReview,
        appealable: form.appealable,
        appealDeadline: form.appealable ? (form.appealDeadline as unknown as Date) : null
      });
    },
    [itemReview, itemReviewService, itemService, userReviewService, eventLoggerService]
  );

  const renderExtraFields = useCallback(
    (
      form: ReviewDecisionFormState,
      onChange: (field: keyof ReviewDecisionFormState, value: unknown) => void,
      disabled: boolean
    ) => (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="reviewOutcomeOpenUserReview"
          checked={form.reviewOutcomeOpenUserReview || false}
          onChange={(e) => onChange('reviewOutcomeOpenUserReview', e.target.checked)}
          disabled={disabled}
          className="rounded border-gray-300"
        />
        <Label htmlFor="reviewOutcomeOpenUserReview">Open User Review for Item Poster</Label>
      </div>
    ),
    []
  );

  const isFormDirty = useCallback(
    (form: ReviewDecisionFormState) => {
      return (
        form.reviewOutcome !== (itemReview.reviewOutcome || null) ||
        form.reviewOutcomeReason !== (itemReview.reviewOutcomeReason || '') ||
        form.reviewOutcomeAction !== (itemReview.reviewOutcomeAction || null) ||
        form.reviewOutcomeComments !== (itemReview.reviewOutcomeComments || '') ||
        form.reviewOutcomeMessageToUser !== (itemReview.reviewOutcomeMessageToUser || '') ||
        form.reviewOutcomeOpenUserReview !== (itemReview.reviewOutcomeOpenUserReview || false) ||
        form.appealable !== itemReview.appealable ||
        form.appealDeadline !==
          (itemReview.appealDeadline ? new Date(itemReview.appealDeadline).toISOString().split('T')[0] : '')
      );
    },
    [itemReview]
  );

  return (
    <ReviewDecisionCard
      review={itemReview}
      actionOptions={ITEM_ACTION_OPTIONS}
      onSubmitAction={handleSubmit}
      onSave={onSave}
      renderExtraFields={renderExtraFields}
      isFormDirty={isFormDirty}
    />
  );
}
