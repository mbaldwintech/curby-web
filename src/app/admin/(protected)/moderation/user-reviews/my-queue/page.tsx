'use client';

import { AdminPageContainer, Button } from '@core/components';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle
} from '@core/components/base/item';
import { ReviewStatus, ReviewTriggerType } from '@core/enumerations';
import { ProfileService, UserReviewService } from '@core/services';
import { Profile, UserReview } from '@core/types';
import { useAuth } from '@supa/providers';
import { createClientService } from '@supa/utils/client';
import { AlertCircle, Clock, Eye, FileText, Flag, RefreshCw, Shield, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function MyUserReviewQueuePage() {
  const { user } = useAuth();
  const router = useRouter();
  const userReviewService = useRef(createClientService(UserReviewService)).current;
  const profileService = useRef(createClientService(ProfileService)).current;
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadUserReviews = useCallback(
    async (reset: boolean = false) => {
      if (!user) return;

      try {
        if (reset) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const reviews = await userReviewService.getAll(
          [
            { column: 'reviewerId', operator: 'eq', value: user.id },
            {
              column: 'status',
              operator: 'in',
              value: [
                ReviewStatus.Pending,
                ReviewStatus.InReview,
                ReviewStatus.AppealPending,
                ReviewStatus.AppealInReview
              ]
            }
          ],
          { column: 'createdAt', ascending: false },
          undefined,
          20
        );

        // Load associated profiles for the reviews
        const profileResults = await Promise.all(
          reviews.map(async (review) => {
            try {
              const profile = await profileService.findByUserId(review.userId);
              return { userId: profile.userId, profile };
            } catch (error) {
              console.error(`Failed to load profile for user ${review.userId}`, error);
              return null;
            }
          })
        );
        const profilesMap = new Map<string, Profile>();
        profileResults.forEach((result) => {
          if (result) {
            profilesMap.set(result.userId, result.profile);
          }
        });

        if (reset) {
          setUserReviews(reviews);
          setProfiles(profilesMap);
        } else {
          setUserReviews((prev) => [...prev, ...reviews]);
          setProfiles((prev) => new Map([...prev, ...profilesMap]));
        }

        setHasMore(reviews.length === 20);
      } catch (error) {
        console.error('Failed to load user reviews', error);
        setError('Failed to load user reviews. Please try again later.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [userReviewService, profileService, user]
  );

  const handleStartReview = useCallback(
    async (reviewId: string) => {
      try {
        await userReviewService.update(reviewId, {
          status: ReviewStatus.InReview,
          reviewStartedAt: new Date()
        });
        // Refresh the list
        loadUserReviews(true);
      } catch (error) {
        console.error('Failed to start review', error);
      }
    },
    [userReviewService, loadUserReviews]
  );

  useEffect(() => {
    loadUserReviews(true);
  }, [loadUserReviews]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case ReviewStatus.Pending:
        return 'text-yellow-600';
      case ReviewStatus.InReview:
        return 'text-blue-600';
      case ReviewStatus.ReviewCompleted:
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case ReviewStatus.Pending:
        return Clock;
      case ReviewStatus.InReview:
        return Eye;
      case ReviewStatus.ReviewCompleted:
        return Shield;
      default:
        return AlertCircle;
    }
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case ReviewTriggerType.Reports:
        return Flag;
      case ReviewTriggerType.AutoFlag:
        return AlertCircle;
      case ReviewTriggerType.Manual:
        return User;
      default:
        return FileText;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && userReviews.length === 0) {
    return (
      <AdminPageContainer title="My User Review Queue">
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminPageContainer>
    );
  }

  if (error) {
    return (
      <AdminPageContainer title="My User Review Queue">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Reviews</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => loadUserReviews(true)} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </AdminPageContainer>
    );
  }

  return (
    <AdminPageContainer title="My User Review Queue">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Review Queue</h2>
        <Button onClick={() => loadUserReviews(true)} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {userReviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Shield className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Reviews Pending</h3>
          <p className="text-muted-foreground">You don&apos;t have any user reviews assigned to you at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <ItemGroup>
            {userReviews.map((review, index) => {
              const StatusIcon = getStatusIcon(review.status);
              const TriggerIcon = getTriggerIcon(review.triggerType);

              const profile = profiles.get(review.userId);

              return (
                <div key={review.id}>
                  <Item
                    variant="outline"
                    className="hover:bg-accent/50 transition-colors"
                    onClick={() => router.push(`/admin/moderation/user-reviews/${review.id}`)}
                  >
                    <ItemHeader>
                      <div className="flex items-center gap-3">
                        {/* User Avatar or Icon */}
                        {profile?.avatarUrl ? (
                          <ItemMedia variant="image">
                            <Image
                              src={profile.avatarUrl}
                              alt={profile.username || 'User Avatar'}
                              fill
                              className="object-cover rounded-md"
                              sizes="(max-width: 768px) 64px, 80px"
                            />
                          </ItemMedia>
                        ) : (
                          <ItemMedia variant="icon">
                            <TriggerIcon className="h-4 w-4" />
                          </ItemMedia>
                        )}
                        <ItemContent>
                          <ItemTitle>
                            {profile?.username || profile?.email || `User ${review.userId.slice(0, 8)}`}
                            <span className={`ml-2 text-xs font-normal ${getStatusColor(review.status)}`}>
                              <StatusIcon className="inline h-3 w-3 mr-1" />
                              {review.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </ItemTitle>
                          <ItemDescription>
                            {review.triggerReason || `${review.triggerType.replace('_', ' ')} trigger`}
                          </ItemDescription>
                        </ItemContent>
                      </div>
                      <ItemActions>
                        {review.status === ReviewStatus.Pending && (
                          <Button onClick={() => handleStartReview(review.id)} size="sm" className="ml-2">
                            <Eye className="h-4 w-4 mr-2" />
                            Start Review
                          </Button>
                        )}
                        {review.status === ReviewStatus.InReview && (
                          <Button
                            onClick={() => router.push(`/admin/moderation/user-reviews/${review.id}`)}
                            size="sm"
                            variant="outline"
                            className="ml-2"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Continue Review
                          </Button>
                        )}
                      </ItemActions>
                    </ItemHeader>

                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">User ID:</span> {review.userId}
                      </div>
                      <div>
                        <span className="font-medium">Trigger:</span> {review.triggerType.replace('_', ' ')}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span> {formatDate(review.createdAt)}
                      </div>
                    </div>

                    {review.reviewStartedAt && (
                      <div className="w-full text-sm text-muted-foreground">
                        <span className="font-medium">Review Started:</span> {formatDate(review.reviewStartedAt)}
                      </div>
                    )}
                  </Item>
                  {index < userReviews.length - 1 && <ItemSeparator />}
                </div>
              );
            })}
          </ItemGroup>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button onClick={() => loadUserReviews(false)} variant="outline" disabled={loadingMore}>
                {loadingMore ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Loading More...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </AdminPageContainer>
  );
}
