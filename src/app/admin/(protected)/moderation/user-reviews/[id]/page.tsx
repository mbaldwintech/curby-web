'use client';

import {
  AdminPageContainer,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@core/components';
import { ReviewStatus, UserRole } from '@core/enumerations';
import { UserReviewService } from '@core/services';
import { UserReview } from '@core/types';
import { ReviewStatusBadge } from '@features/moderation/components';
import {
  UserReviewAppealInformationCard,
  UserReviewAppealReviewDecisionCard,
  UserReviewAppealReviewNotesCard,
  UserReviewDecisionCard,
  UserReviewNotesCard,
  UserReviewTimelineCard,
  UserReviewTriggerInformationCard
} from '@features/moderation/user-reviews/components';
import { ProfileCard } from '@features/users/components';
import { useProfile } from '@features/users/hooks';
import { createClientService } from '@supa/utils/client';
import { Shield } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn, createLogger, formatDateTime } from '@core/utils';

const logger = createLogger('UserReviewDetailPage');

export default function UserReviewDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useProfile();
  const userReviewService = useRef(createClientService(UserReviewService)).current;

  const [userReview, setUserReview] = useState<UserReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = useMemo(() => {
    if (!profile) return false;
    return profile.role === UserRole.Admin;
  }, [profile]);

  const isModerator = useMemo(() => {
    if (!profile) return false;
    return profile.role === UserRole.Moderator;
  }, [profile]);

  const isAppealMode = useMemo(() => {
    if (!userReview) return false;
    return userReview.status.includes('appeal');
  }, [userReview]);

  const refresh = useCallback(async () => {
    if (!params.id || typeof params.id !== 'string') {
      setError('Invalid review ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const review = await userReviewService.getById(params.id);
      setUserReview(review);
    } catch (err) {
      logger.error('Failed to load review data', err);
      setError('Failed to load review data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [params.id, userReviewService]);

  const startReview = useCallback(async () => {
    if (!userReview || !profile || (!isModerator && !isAdmin)) return;

    try {
      await userReviewService.update(userReview.id, {
        status: ReviewStatus.InReview,
        reviewerId: profile.userId,
        reviewStartedAt: new Date()
      });

      refresh();
    } catch (error) {
      logger.error('Failed to start review', error);
      setError('Failed to start review. Please try again.');
    }
  }, [userReview, profile, isModerator, isAdmin, userReviewService, refresh]);

  const startAppealReview = useCallback(async () => {
    if (!userReview || !profile || (!isModerator && !isAdmin)) return;

    try {
      await userReviewService.update(userReview.id, {
        status: ReviewStatus.AppealInReview,
        appealReviewerId: profile.userId,
        appealReviewStartedAt: new Date()
      });

      refresh();
    } catch (error) {
      logger.error('Failed to start appeal review', error);
      setError('Failed to start appeal review. Please try again.');
    }
  }, [userReview, profile, isModerator, isAdmin, userReviewService, refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AdminPageContainer
      title={`${isAppealMode ? 'Appeal ' : ''}Review #${userReview?.id.slice(0, 8)}`}
      loading={loading}
      error={error}
      retry={refresh}
    >
      {userReview && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ReviewStatusBadge status={userReview.status} />
              <span className="text-sm text-muted-foreground">Created {formatDateTime(userReview.createdAt)}</span>
            </div>
            <div className="flex gap-2">
              {userReview.status === ReviewStatus.Pending && (
                <Button onClick={startReview}>
                  <Shield className="h-4 w-4 mr-2" />
                  Start Review
                </Button>
              )}
              {userReview.status === ReviewStatus.AppealPending && (
                <Button onClick={startAppealReview}>
                  <Shield className="h-4 w-4 mr-2" />
                  Start Appeal Review
                </Button>
              )}
              <Button variant="outline" onClick={() => router.push('/admin/moderation/user-reviews/my-queue')}>
                Back to Queue
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <UserReviewTriggerInformationCard userReview={userReview} />
              {isAppealMode && <UserReviewAppealInformationCard userReview={userReview} />}
            </div>

            <UserReviewTimelineCard userReview={userReview} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="review" className="space-y-4">
                <TabsList
                  className={cn(
                    `grid w-full`,
                    userReview.appealable && userReview.appealedAt ? 'grid-cols-3' : 'grid-cols-2'
                  )}
                >
                  <TabsTrigger value="review">Review</TabsTrigger>
                  {userReview.appealable && userReview.appealedAt && (
                    <TabsTrigger value="appeal-review">Appeal Review</TabsTrigger>
                  )}
                  <TabsTrigger value="user-details">User Details</TabsTrigger>
                </TabsList>

                <TabsContent value="review" className="space-y-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 lg:basis-2/3 min-w-0">
                      <UserReviewDecisionCard userReview={userReview} onSave={refresh} />
                    </div>
                    <div className="flex-1 lg:basis-1/3 min-w-0">
                      <UserReviewNotesCard userReview={userReview} onSave={refresh} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="appeal-review" className="space-y-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 lg:basis-2/3 min-w-0">
                      <UserReviewAppealReviewDecisionCard userReview={userReview} onSave={refresh} />
                    </div>
                    <div className="flex-1 lg:basis-1/3 min-w-0">
                      <UserReviewAppealReviewNotesCard userReview={userReview} onSave={refresh} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="user-details" className="space-y-4">
                  <ProfileCard userId={userReview.userId} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminPageContainer>
  );
}
