import { EventTypeKey, ItemReviewAppealReviewOutcomeAction, ReviewStatus } from '@core/enumerations';
import { EventLoggerService, ItemReviewService, ItemService } from '@core/services';
import { ItemReview } from '@core/types';
import { AppealActionOption, AppealDecisionFormState, ReviewAppealDecisionCard } from '@features/moderation/shared';
import { createClientService } from '@supa/utils/client';
import { useCallback, useRef } from 'react';

interface ItemReviewAppealReviewDecisionCardProps {
  itemReview: ItemReview;
  onSave?: () => void;
}

const ITEM_APPEAL_ACTION_OPTIONS: AppealActionOption[] = [
  { value: ItemReviewAppealReviewOutcomeAction.NoAction, label: 'No Action Required' },
  { value: ItemReviewAppealReviewOutcomeAction.ItemRemovalReversed, label: 'Restore Item' }
];

export function ItemReviewAppealReviewDecisionCard({ itemReview, onSave }: ItemReviewAppealReviewDecisionCardProps) {
  const itemReviewService = useRef(createClientService(ItemReviewService)).current;
  const itemService = useRef(createClientService(ItemService)).current;
  const eventLoggerService = useRef(createClientService(EventLoggerService)).current;

  const handleSubmit = useCallback(
    async (form: AppealDecisionFormState) => {
      if (form.appealReviewOutcomeAction === ItemReviewAppealReviewOutcomeAction.ItemRemovalReversed) {
        await itemService.restoreItem(itemReview.itemId);
        await eventLoggerService.log(EventTypeKey.ReportedFreeItemRemovalReversed, { itemId: itemReview.itemId });
      }

      await itemReviewService.update(itemReview.id, {
        status: ReviewStatus.AppealCompleted,
        appealReviewCompletedAt: new Date(),
        appealReviewOutcome: form.appealReviewOutcome ?? null,
        appealReviewOutcomeReason: form.appealReviewOutcomeReason,
        appealReviewOutcomeAction: form.appealReviewOutcomeAction as ItemReviewAppealReviewOutcomeAction,
        appealReviewOutcomeActionTakenAt: new Date(),
        appealReviewOutcomeComments: form.appealReviewOutcomeComments,
        appealReviewOutcomeMessageToUser: form.appealReviewOutcomeMessageToUser
      });
    },
    [itemReview, itemReviewService, itemService, eventLoggerService]
  );

  return (
    <ReviewAppealDecisionCard
      review={itemReview}
      actionOptions={ITEM_APPEAL_ACTION_OPTIONS}
      onSubmitAction={handleSubmit}
      onSave={onSave}
    />
  );
}
