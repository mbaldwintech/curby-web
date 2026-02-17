import { EventTypeKey, ReviewStatus, UserReviewAppealReviewOutcomeAction, UserStatus } from '@core/enumerations';
import {
  EventLoggerService,
  ProfileService,
  UserBanService,
  UserReviewService,
  UserSuspensionService,
  UserWarningService
} from '@core/services';
import { UserReview } from '@core/types';
import { AppealActionOption, AppealDecisionFormState, ReviewAppealDecisionCard } from '@features/moderation/shared';
import { createClientService } from '@supa/utils/client';
import { useCallback, useRef } from 'react';

interface UserReviewAppealReviewDecisionCardProps {
  userReview: UserReview;
  onSave?: () => void;
}

const USER_APPEAL_ACTION_OPTIONS: AppealActionOption[] = [
  { value: UserReviewAppealReviewOutcomeAction.NoAction, label: 'No Action Required' },
  { value: UserReviewAppealReviewOutcomeAction.UserWarningRetracted, label: 'Retract Warning' },
  { value: UserReviewAppealReviewOutcomeAction.UserSuspensionLifted, label: 'Lift Suspension' },
  { value: UserReviewAppealReviewOutcomeAction.UserBanLifted, label: 'Lift Ban' }
];

export function UserReviewAppealReviewDecisionCard({ userReview, onSave }: UserReviewAppealReviewDecisionCardProps) {
  const userReviewService = useRef(createClientService(UserReviewService)).current;
  const profileService = useRef(createClientService(ProfileService)).current;
  const userWarningService = useRef(createClientService(UserWarningService)).current;
  const userSuspensionService = useRef(createClientService(UserSuspensionService)).current;
  const userBanService = useRef(createClientService(UserBanService)).current;
  const eventLoggerService = useRef(createClientService(EventLoggerService)).current;

  const handleSubmit = useCallback(
    async (form: AppealDecisionFormState) => {
      if (form.appealReviewOutcomeAction === UserReviewAppealReviewOutcomeAction.UserWarningRetracted) {
        const warning = await userWarningService.getOne({
          column: 'userReviewId',
          operator: 'eq',
          value: userReview.id
        });
        if (warning) {
          await userWarningService.update(warning.id, {
            retractedAt: new Date()
          });
        }
        await eventLoggerService.log(EventTypeKey.UserWarned, { userId: userReview.userId });
      } else if (form.appealReviewOutcomeAction === UserReviewAppealReviewOutcomeAction.UserSuspensionLifted) {
        const suspension = await userSuspensionService.getOne({
          column: 'userReviewId',
          operator: 'eq',
          value: userReview.id
        });
        if (suspension) {
          await userSuspensionService.update(suspension.id, { active: false, liftedAt: new Date() });
        }
        const otherSuspensions = await userSuspensionService.getAll([
          { column: 'userId', operator: 'eq', value: userReview.userId },
          { column: 'active', operator: 'eq', value: true }
        ]);
        if (otherSuspensions.length === 0) {
          const profile = await profileService.findByUserId(userReview.userId);
          if (profile) {
            await profileService.update(profile.id, { status: UserStatus.Active });
          }
        }
        await eventLoggerService.log(EventTypeKey.UserUnsuspended, { userId: userReview.userId });
      } else if (form.appealReviewOutcomeAction === UserReviewAppealReviewOutcomeAction.UserBanLifted) {
        const ban = await userBanService.getOne({
          column: 'userReviewId',
          operator: 'eq',
          value: userReview.id
        });
        if (ban) {
          await userBanService.update(ban.id, { active: false, liftedAt: new Date() });
        }
        const otherBans = await userBanService.getAll([
          { column: 'userId', operator: 'eq', value: userReview.userId },
          { column: 'active', operator: 'eq', value: true }
        ]);
        if (otherBans.length === 0) {
          const profile = await profileService.findByUserId(userReview.userId);
          if (profile) {
            await profileService.update(profile.id, { status: UserStatus.Active });
          }
        }
        await eventLoggerService.log(EventTypeKey.UserUnbanned, { userId: userReview.userId });
      }

      await userReviewService.update(userReview.id, {
        status: ReviewStatus.AppealCompleted,
        appealReviewCompletedAt: new Date(),
        appealReviewOutcome: form.appealReviewOutcome ?? null,
        appealReviewOutcomeReason: form.appealReviewOutcomeReason,
        appealReviewOutcomeAction: form.appealReviewOutcomeAction as UserReviewAppealReviewOutcomeAction,
        appealReviewOutcomeActionTakenAt: new Date(),
        appealReviewOutcomeComments: form.appealReviewOutcomeComments,
        appealReviewOutcomeMessageToUser: form.appealReviewOutcomeMessageToUser
      });
    },
    [
      userReview,
      userReviewService,
      eventLoggerService,
      userWarningService,
      userSuspensionService,
      profileService,
      userBanService
    ]
  );

  return (
    <ReviewAppealDecisionCard
      review={userReview}
      actionOptions={USER_APPEAL_ACTION_OPTIONS}
      onSubmitAction={handleSubmit}
      onSave={onSave}
    />
  );
}
