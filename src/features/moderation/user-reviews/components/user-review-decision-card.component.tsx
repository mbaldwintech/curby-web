import { Button, Skeleton } from '@core/components';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@core/components/base/card';
import { Input } from '@core/components/base/input';
import { Label } from '@core/components/base/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@core/components/base/select';
import { Separator } from '@core/components/base/separator';
import { Textarea } from '@core/components/base/textarea';
import {
  EventTypeKey,
  ReviewOutcome,
  ReviewStatus,
  UserReviewOutcomeAction,
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

interface ReviewFormProps {
  userReview: UserReview;
  onSave?: () => void;
}

export function UserReviewDecisionCard({ userReview, onSave }: ReviewFormProps) {
  const userReviewService = useRef(createClientService(UserReviewService)).current;
  const profileService = useRef(createClientService(ProfileService)).current;
  const userWarningService = useRef(createClientService(UserWarningService)).current;
  const userSuspensionService = useRef(createClientService(UserSuspensionService)).current;
  const userBanService = useRef(createClientService(UserBanService)).current;
  const eventLoggerService = useRef(createClientService(EventLoggerService)).current;
  const [userReviewForm, setUserReviewForm] = useState<Partial<UserReview>>({
    reviewOutcome: userReview.reviewOutcome || null,
    reviewOutcomeReason: userReview.reviewOutcomeReason || '',
    reviewOutcomeAction: userReview.reviewOutcomeAction || null,
    reviewOutcomeComments: userReview.reviewOutcomeComments || '',
    reviewOutcomeMessageToUser: userReview.reviewOutcomeMessageToUser || '',
    appealable: userReview.appealable,
    appealDeadline: (userReview.appealDeadline
      ? new Date(userReview.appealDeadline).toISOString().split('T')[0]
      : '') as unknown as Date | null
  });
  const [warningExpiresAt, setWarningExpiresAt] = useState<Date | null>(null);
  const [suspensionEffectiveTo, setSuspensionEffectiveTo] = useState<Date | null>(null);
  const isDirty = useMemo(() => {
    return (
      userReviewForm.reviewOutcome !== userReview.reviewOutcome ||
      userReviewForm.reviewOutcomeReason !== userReview.reviewOutcomeReason ||
      userReviewForm.reviewOutcomeAction !== userReview.reviewOutcomeAction ||
      warningExpiresAt !== null ||
      suspensionEffectiveTo !== null ||
      userReviewForm.reviewOutcomeComments !== userReview.reviewOutcomeComments ||
      userReviewForm.reviewOutcomeMessageToUser !== userReview.reviewOutcomeMessageToUser ||
      userReviewForm.appealable !== userReview.appealable ||
      userReviewForm.appealDeadline !==
        ((userReview.appealDeadline
          ? new Date(userReview.appealDeadline).toISOString().split('T')[0]
          : '') as unknown as Date | null)
    );
  }, [userReviewForm, userReview, warningExpiresAt, suspensionEffectiveTo]);
  const isValid = useMemo(() => {
    let userActionDetailsValid = false;
    switch (userReviewForm.reviewOutcomeAction) {
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
    return userReviewForm.reviewOutcome && userReviewForm.reviewOutcomeAction && userActionDetailsValid ? true : false;
  }, [userReviewForm, warningExpiresAt, suspensionEffectiveTo]);
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

  const onChange = useCallback(
    <K extends keyof UserReview>(value: UserReview[K], field: K) => {
      if (disabled) return;
      setUserReviewForm((prev) => ({ ...prev, [field]: value }));
    },
    [disabled]
  );

  const onSubmit = useCallback(async () => {
    if (disabled || !isValid) return;

    try {
      setSubmitting(true);
      setError(null);

      // Apply specified action
      if (userReviewForm.reviewOutcomeAction === UserReviewOutcomeAction.UserWarning) {
        await userWarningService.create({
          userId: userReview.userId,
          warningAt: new Date(),
          reason: userReviewForm.reviewOutcomeReason || 'Warning issued by moderator',
          userReviewId: userReview.id,
          expiresAt: warningExpiresAt
        });
        await eventLoggerService.log(EventTypeKey.UserWarned, { userId: userReview.userId });
      } else if (userReviewForm.reviewOutcomeAction === UserReviewOutcomeAction.UserSuspension) {
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
      } else if (userReviewForm.reviewOutcomeAction === UserReviewOutcomeAction.UserBan) {
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
        reviewOutcome: userReviewForm.reviewOutcome,
        reviewOutcomeReason: userReviewForm.reviewOutcomeReason,
        reviewOutcomeAction: userReviewForm.reviewOutcomeAction,
        reviewOutcomeActionTakenAt: new Date(),
        reviewOutcomeComments: userReviewForm.reviewOutcomeComments,
        reviewOutcomeMessageToUser: userReviewForm.reviewOutcomeMessageToUser,
        appealable: userReviewForm.appealable,
        appealDeadline: userReviewForm.appealable ? userReviewForm.appealDeadline : null
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
    userReview,
    disabled,
    userReviewForm,
    onSave,
    profileService,
    userReviewService,
    eventLoggerService,
    userWarningService,
    warningExpiresAt,
    isValid,
    userSuspensionService,
    suspensionEffectiveTo,
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
        <CardTitle className="flex items-center gap-2">Review Decision</CardTitle>
        <CardDescription>Complete your review and decide on the appropriate action.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row md:gap-4">
          <div className="space-y-1 min-w-[200px]">
            <Label htmlFor="reviewOutcome">Review Outcome *</Label>
            <Select
              value={userReviewForm.reviewOutcome || ''}
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
              value={userReviewForm.reviewOutcomeReason ?? ''}
              onChange={(e) => onChange(e.target.value, 'reviewOutcomeReason')}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:gap-4">
          <div className="space-y-1 min-w-[200px]">
            <Label htmlFor="reviewOutcomeAction">Action to Take *</Label>
            <Select
              value={userReviewForm.reviewOutcomeAction || ''}
              onValueChange={(value) => onChange(value as UserReviewOutcomeAction, 'reviewOutcomeAction')}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select action..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserReviewOutcomeAction.NoAction}>No Action Required</SelectItem>
                <SelectItem value={UserReviewOutcomeAction.UserWarning}>Issue Warning</SelectItem>
                <SelectItem value={UserReviewOutcomeAction.UserSuspension}>Suspend User</SelectItem>
                <SelectItem value={UserReviewOutcomeAction.UserBan}>Ban User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1 w-full">
            <Label htmlFor="reviewOutcomeComments">Internal Comments</Label>
            <Textarea
              id="reviewOutcomeComments"
              placeholder="Internal comments for other reviewers..."
              value={userReviewForm.reviewOutcomeComments || ''}
              onChange={(e) => onChange(e.target.value, 'reviewOutcomeComments')}
              disabled={disabled}
            />
          </div>
        </div>

        <div>
          {userReviewForm.reviewOutcomeAction === UserReviewOutcomeAction.UserWarning && (
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

          {userReviewForm.reviewOutcomeAction === UserReviewOutcomeAction.UserSuspension && (
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

        <div className="space-y-1">
          <Label htmlFor="reviewOutcomeMessageToUser">Message to User</Label>
          <Textarea
            id="reviewOutcomeMessageToUser"
            placeholder="Message that will be sent to the user..."
            value={userReviewForm.reviewOutcomeMessageToUser || ''}
            onChange={(e) => onChange(e.target.value, 'reviewOutcomeMessageToUser')}
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
              checked={userReviewForm.appealable}
              onChange={(e) => onChange(e.target.checked, 'appealable')}
              disabled={disabled}
              className="rounded border-gray-300"
            />
            <Label htmlFor="appealable">Allow Appeal</Label>
          </div>
          {userReviewForm.appealable && (
            <div className="space-y-1">
              <Label htmlFor="appealDeadline">Appeal Deadline</Label>
              <Input
                id="appealDeadline"
                type="date"
                value={(userReviewForm.appealDeadline as unknown as string) || ''}
                onChange={(e) => onChange(e.target.value as unknown as Date, 'appealDeadline')}
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
