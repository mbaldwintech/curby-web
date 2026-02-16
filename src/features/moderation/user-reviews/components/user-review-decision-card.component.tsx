import { Input } from '@core/components/base/input';
import { Label } from '@core/components/base/label';
import { EventTypeKey, ReviewStatus, UserReviewOutcomeAction, UserStatus } from '@core/enumerations';
import {
  EventLoggerService,
  ProfileService,
  UserBanService,
  UserReviewService,
  UserSuspensionService,
  UserWarningService
} from '@core/services';
import { UserReview } from '@core/types';
import { ActionOption, ReviewDecisionCard, ReviewDecisionFormState } from '@features/moderation/shared';
import { createClientService } from '@supa/utils/client';
import { useCallback, useRef, useState } from 'react';

interface ReviewFormProps {
  userReview: UserReview;
  onSave?: () => void;
}

const USER_ACTION_OPTIONS: ActionOption[] = [
  { value: UserReviewOutcomeAction.NoAction, label: 'No Action Required' },
  { value: UserReviewOutcomeAction.UserWarning, label: 'Issue Warning' },
  { value: UserReviewOutcomeAction.UserSuspension, label: 'Suspend User' },
  { value: UserReviewOutcomeAction.UserBan, label: 'Ban User' }
];

export function UserReviewDecisionCard({ userReview, onSave }: ReviewFormProps) {
  const userReviewService = useRef(createClientService(UserReviewService)).current;
  const profileService = useRef(createClientService(ProfileService)).current;
  const userWarningService = useRef(createClientService(UserWarningService)).current;
  const userSuspensionService = useRef(createClientService(UserSuspensionService)).current;
  const userBanService = useRef(createClientService(UserBanService)).current;
  const eventLoggerService = useRef(createClientService(EventLoggerService)).current;
  const [warningExpiresAt, setWarningExpiresAt] = useState<Date | null>(null);
  const [suspensionEffectiveTo, setSuspensionEffectiveTo] = useState<Date | null>(null);

  const handleSubmit = useCallback(
    async (form: ReviewDecisionFormState) => {
      // Apply specified action
      if (form.reviewOutcomeAction === UserReviewOutcomeAction.UserWarning) {
        await userWarningService.create({
          userId: userReview.userId,
          warningAt: new Date(),
          reason: form.reviewOutcomeReason || 'Warning issued by moderator',
          userReviewId: userReview.id,
          expiresAt: warningExpiresAt
        });
        await eventLoggerService.log(EventTypeKey.UserWarned, { userId: userReview.userId });
      } else if (form.reviewOutcomeAction === UserReviewOutcomeAction.UserSuspension) {
        await userSuspensionService.create({
          userId: userReview.userId,
          active: true,
          effectiveFrom: new Date(),
          effectiveTo: suspensionEffectiveTo,
          userReviewId: userReview.id
        });
        const profile = await profileService.findByUserId(userReview.userId);
        await profileService.update(profile.id, { status: UserStatus.Suspended });
        await eventLoggerService.log(EventTypeKey.UserSuspended, { userId: userReview.userId });
      } else if (form.reviewOutcomeAction === UserReviewOutcomeAction.UserBan) {
        await userBanService.create({
          userId: userReview.userId,
          active: true,
          bannedAt: new Date(),
          userReviewId: userReview.id
        });
        const profile = await profileService.findByUserId(userReview.userId);
        await profileService.update(profile.id, { status: UserStatus.Banned });
        await eventLoggerService.log(EventTypeKey.UserBanned, { userId: userReview.userId });
      }

      // Update the review record
      await userReviewService.update(userReview.id, {
        status: ReviewStatus.ReviewCompleted,
        reviewCompletedAt: new Date(),
        reviewOutcome: form.reviewOutcome,
        reviewOutcomeReason: form.reviewOutcomeReason,
        reviewOutcomeAction: form.reviewOutcomeAction as UserReviewOutcomeAction,
        reviewOutcomeActionTakenAt: new Date(),
        reviewOutcomeComments: form.reviewOutcomeComments,
        reviewOutcomeMessageToUser: form.reviewOutcomeMessageToUser,
        appealable: form.appealable,
        appealDeadline: form.appealable ? (form.appealDeadline as unknown as Date) : null
      });
    },
    [
      userReview,
      userReviewService,
      profileService,
      eventLoggerService,
      userWarningService,
      warningExpiresAt,
      userSuspensionService,
      suspensionEffectiveTo,
      userBanService
    ]
  );

  const renderExtraFields = useCallback(
    (
      form: ReviewDecisionFormState,
      _onChange: (field: keyof ReviewDecisionFormState, value: unknown) => void,
      disabled: boolean
    ) => (
      <div>
        {form.reviewOutcomeAction === UserReviewOutcomeAction.UserWarning && (
          <div className="space-y-1">
            <Label htmlFor="warningExpiresAt">Warning Expiration Date *</Label>
            <Input
              id="warningExpiresAt"
              type="date"
              value={warningExpiresAt ? warningExpiresAt.toISOString().split('T')[0] : ''}
              onChange={(e) => setWarningExpiresAt(new Date(e.target.value))}
              disabled={disabled}
            />
          </div>
        )}

        {form.reviewOutcomeAction === UserReviewOutcomeAction.UserSuspension && (
          <div className="space-y-1">
            <Label htmlFor="suspensionEffectiveTo">Suspension Effective To *</Label>
            <Input
              id="suspensionEffectiveTo"
              type="date"
              value={suspensionEffectiveTo ? suspensionEffectiveTo.toISOString().split('T')[0] : ''}
              onChange={(e) => setSuspensionEffectiveTo(new Date(e.target.value))}
              disabled={disabled}
            />
          </div>
        )}
      </div>
    ),
    [warningExpiresAt, suspensionEffectiveTo]
  );

  const isFormValid = useCallback(
    (form: ReviewDecisionFormState) => {
      let userActionDetailsValid = false;
      switch (form.reviewOutcomeAction) {
        case UserReviewOutcomeAction.UserWarning:
          if (warningExpiresAt) {
            userActionDetailsValid = true;
          }
          break;
        case UserReviewOutcomeAction.UserSuspension:
          if (suspensionEffectiveTo) {
            userActionDetailsValid = true;
          }
          break;
        case UserReviewOutcomeAction.UserBan:
          userActionDetailsValid = true;
          break;
        default:
          break;
      }
      return form.reviewOutcome && form.reviewOutcomeAction && userActionDetailsValid ? true : false;
    },
    [warningExpiresAt, suspensionEffectiveTo]
  );

  const isFormDirty = useCallback(
    (form: ReviewDecisionFormState) => {
      return (
        form.reviewOutcome !== (userReview.reviewOutcome || null) ||
        form.reviewOutcomeReason !== (userReview.reviewOutcomeReason || '') ||
        form.reviewOutcomeAction !== (userReview.reviewOutcomeAction || null) ||
        warningExpiresAt !== null ||
        suspensionEffectiveTo !== null ||
        form.reviewOutcomeComments !== (userReview.reviewOutcomeComments || '') ||
        form.reviewOutcomeMessageToUser !== (userReview.reviewOutcomeMessageToUser || '') ||
        form.appealable !== userReview.appealable ||
        form.appealDeadline !==
          (userReview.appealDeadline ? new Date(userReview.appealDeadline).toISOString().split('T')[0] : '')
      );
    },
    [userReview, warningExpiresAt, suspensionEffectiveTo]
  );

  return (
    <ReviewDecisionCard
      review={userReview}
      actionOptions={USER_ACTION_OPTIONS}
      onSubmitAction={handleSubmit}
      onSave={onSave}
      renderExtraFields={renderExtraFields}
      isFormValid={isFormValid}
      isFormDirty={isFormDirty}
    />
  );
}
