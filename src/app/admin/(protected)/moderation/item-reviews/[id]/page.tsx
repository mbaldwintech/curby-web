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
import { ItemReviewService } from '@core/services';
import { ItemReview } from '@core/types';
import { cn, formatDateTime } from '@core/utils';
import { ItemActivityCard, ItemCard } from '@features/items/components';
import { ReviewStatusBadge } from '@features/moderation/components';
import {
  ItemReviewAppealInformationCard,
  ItemReviewAppealReviewDecisionCard,
  ItemReviewAppealReviewNotesCard,
  ItemReviewDecisionCard,
  ItemReviewNotesCard,
  ItemReviewTimelineCard,
  ItemReviewTriggerInformationCard
} from '@features/moderation/item-reviews/components';
import { useProfile } from '@features/users/hooks';
import { createClientService } from '@supa/utils/client';
import { Shield } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export default function ItemReviewDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useProfile();
  const itemReviewService = useRef(createClientService(ItemReviewService)).current;

  const [itemReview, setItemReview] = useState<ItemReview | null>(null);
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
    if (!itemReview) return false;
    return itemReview.status.includes('appeal');
  }, [itemReview]);

  const refresh = useCallback(async () => {
    if (!params.id || typeof params.id !== 'string') {
      setError('Invalid review ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const review = await itemReviewService.getById(params.id);
      setItemReview(review);
    } catch (err) {
      console.error('Failed to load review data', err);
      setError('Failed to load review data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [params.id, itemReviewService]);

  const startReview = useCallback(async () => {
    if (!itemReview || !profile || (!isModerator && !isAdmin)) return;

    try {
      await itemReviewService.update(itemReview.id, {
        status: ReviewStatus.InReview,
        reviewerId: profile.userId,
        reviewStartedAt: new Date()
      });

      refresh();
    } catch (error) {
      console.error('Failed to start review', error);
      setError('Failed to start review. Please try again.');
    }
  }, [itemReview, profile, isModerator, isAdmin, itemReviewService, refresh]);

  const startAppealReview = useCallback(async () => {
    if (!itemReview || !profile || (!isModerator && !isAdmin)) return;

    try {
      await itemReviewService.update(itemReview.id, {
        status: ReviewStatus.AppealInReview,
        appealReviewerId: profile.userId,
        appealReviewStartedAt: new Date()
      });

      refresh();
    } catch (error) {
      console.error('Failed to start appeal review', error);
      setError('Failed to start appeal review. Please try again.');
    }
  }, [itemReview, profile, isModerator, isAdmin, itemReviewService, refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AdminPageContainer
      title={`${isAppealMode ? 'Appeal ' : ''}Review #${itemReview?.id.slice(0, 8)}`}
      loading={loading}
      error={error}
      retry={refresh}
    >
      {itemReview && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ReviewStatusBadge status={itemReview.status} />
              <span className="text-sm text-muted-foreground">Created {formatDateTime(itemReview.createdAt)}</span>
            </div>
            <div className="flex gap-2">
              {itemReview.status === ReviewStatus.Pending && (
                <Button onClick={startReview}>
                  <Shield className="h-4 w-4 mr-2" />
                  Start Review
                </Button>
              )}
              {itemReview.status === ReviewStatus.AppealPending && (
                <Button onClick={startAppealReview}>
                  <Shield className="h-4 w-4 mr-2" />
                  Start Appeal Review
                </Button>
              )}
              <Button variant="outline" onClick={() => router.push('/admin/moderation/item-reviews/my-queue')}>
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
              <ItemReviewTriggerInformationCard itemReview={itemReview} />
              {isAppealMode && <ItemReviewAppealInformationCard itemReview={itemReview} />}
            </div>

            <ItemReviewTimelineCard itemReview={itemReview} />
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
                    itemReview.appealable && itemReview.appealedAt ? 'grid-cols-4' : 'grid-cols-3'
                  )}
                >
                  <TabsTrigger value="review">Review</TabsTrigger>
                  {itemReview.appealable && itemReview.appealedAt && (
                    <TabsTrigger value="appeal-review">Appeal Review</TabsTrigger>
                  )}
                  <TabsTrigger value="item-details">Item Details</TabsTrigger>
                  <TabsTrigger value="item-activity">Item Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="review" className="space-y-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 lg:basis-2/3 min-w-0">
                      <ItemReviewDecisionCard itemReview={itemReview} onSave={refresh} />
                    </div>
                    <div className="flex-1 lg:basis-1/3 min-w-0">
                      <ItemReviewNotesCard itemReview={itemReview} onSave={refresh} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="appeal-review" className="space-y-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 lg:basis-2/3 min-w-0">
                      <ItemReviewAppealReviewDecisionCard itemReview={itemReview} onSave={refresh} />
                    </div>
                    <div className="flex-1 lg:basis-1/3 min-w-0">
                      <ItemReviewAppealReviewNotesCard itemReview={itemReview} onSave={refresh} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="item-details" className="space-y-4">
                  <ItemCard itemId={itemReview.itemId} />
                </TabsContent>

                <TabsContent value="item-activity" className="space-y-4">
                  <ItemActivityCard itemId={itemReview.itemId} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminPageContainer>
  );
}
