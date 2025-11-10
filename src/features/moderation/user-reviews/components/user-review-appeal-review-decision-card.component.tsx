import { Button, Skeleton } from '@core/components';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@core/components/base/card';
import { Label } from '@core/components/base/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@core/components/base/select';
import { Separator } from '@core/components/base/separator';
import { Textarea } from '@core/components/base/textarea';
import {
  AppealReviewOutcome,
  EventTypeKey,
  ReviewStatus,
  UserReviewAppealReviewOutcomeAction,
  UserRole,
  UserStatus
} from '@core/enumerations';
import {
  EventLoggerService,
  ProfileService,
  UserBanService,
  UserReviewService,
  UserSuspensionService,
  UserWarningService
} from '@core/services';
import { UserReview } from '@core/types';
import { useProfile } from '@features/users/hooks';
import { createClientService } from '@supa/utils/client';
import { useCallback, useMemo, useRef, useState } from 'react';

interface UserReviewAppealReviewDecisionCardProps {
  userReview: UserReview;
  onSave?: () => void;
}

export function UserReviewAppealReviewDecisionCard({ userReview, onSave }: UserReviewAppealReviewDecisionCardProps) {
  const userReviewService = useRef(createClientService(UserReviewService)).current;
  const profileService = useRef(createClientService(ProfileService)).current;
  const userWarningService = useRef(createClientService(UserWarningService)).current;
  const userSuspensionService = useRef(createClientService(UserSuspensionService)).current;
  const userBanService = useRef(createClientService(UserBanService)).current;
  const eventLoggerService = useRef(createClientService(EventLoggerService)).current;
  const [appealForm, setAppealForm] = useState<Partial<UserReview>>({
    appealReviewOutcome: userReview.appealReviewOutcome ?? null,
    appealReviewOutcomeReason: userReview.appealReviewOutcomeReason || '',
    appealReviewOutcomeAction: userReview.appealReviewOutcomeAction ?? null,
    appealReviewOutcomeComments: userReview.appealReviewOutcomeComments || '',
    appealReviewOutcomeMessageToUser: userReview.appealReviewOutcomeMessageToUser || ''
  });
  const isDirty = useMemo(() => {
    return (
      appealForm.appealReviewOutcome !== userReview.appealReviewOutcome ||
      appealForm.appealReviewOutcomeReason !== userReview.appealReviewOutcomeReason ||
      appealForm.appealReviewOutcomeAction !== userReview.appealReviewOutcomeAction ||
      appealForm.appealReviewOutcomeComments !== userReview.appealReviewOutcomeComments ||
      appealForm.appealReviewOutcomeMessageToUser !== userReview.appealReviewOutcomeMessageToUser
    );
  }, [appealForm, userReview]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const isAppealReviewInProgress = useMemo(() => userReview?.status === ReviewStatus.AppealInReview, [userReview]);

  const { profile } = useProfile();

  const isAppealReviewer = useMemo(() => {
    if (!userReview || !profile) return false;
    return userReview.appealReviewerId === profile.userId;
  }, [userReview, profile]);

  const isAdmin = useMemo(() => {
    if (!profile) return false;
    return profile.role === UserRole.Admin;
  }, [profile]);

  const disabled = useMemo(
    () => submitting || !userReview || !isAppealReviewInProgress || (!isAppealReviewer && !isAdmin),
    [submitting, userReview, isAppealReviewInProgress, isAppealReviewer, isAdmin]
  );

  const onChange = useCallback(
    <K extends keyof UserReview>(value: UserReview[K], field: K) => {
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

      if (appealForm.appealReviewOutcomeAction === UserReviewAppealReviewOutcomeAction.UserWarningRetracted) {
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
      } else if (appealForm.appealReviewOutcomeAction === UserReviewAppealReviewOutcomeAction.UserSuspensionLifted) {
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
      } else if (appealForm.appealReviewOutcomeAction === UserReviewAppealReviewOutcomeAction.UserBanLifted) {
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
  }, [
    userReview,
    appealForm,
    onSave,
    userReviewService,
    disabled,
    eventLoggerService,
    userWarningService,
    userSuspensionService,
    profileService,
    userBanService
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
                onChange(value as UserReviewAppealReviewOutcomeAction, 'appealReviewOutcomeAction')
              }
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select appeal action..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserReviewAppealReviewOutcomeAction.NoAction}>No Action Required</SelectItem>
                <SelectItem value={UserReviewAppealReviewOutcomeAction.UserWarningRetracted}>
                  Retract Warning
                </SelectItem>
                <SelectItem value={UserReviewAppealReviewOutcomeAction.UserSuspensionLifted}>
                  Lift Suspension
                </SelectItem>
                <SelectItem value={UserReviewAppealReviewOutcomeAction.UserBanLifted}>Lift Ban</SelectItem>
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
