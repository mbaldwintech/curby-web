import { Card, CardContent, CardHeader, CardTitle } from '@core/components';
import { ItemReview } from '@core/types';
import { formatDateTime } from '@core/utils';
import { Calendar } from 'lucide-react';

export const ItemReviewTimelineCard = ({ itemReview }: { itemReview: ItemReview }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Review Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Review Created</span>
            <span>{formatDateTime(itemReview.createdAt)}</span>
          </div>

          {itemReview.reviewStartedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Review Started</span>
              <span>{formatDateTime(itemReview.reviewStartedAt)}</span>
            </div>
          )}

          {itemReview.reviewCompletedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Review Completed</span>
              <span>{formatDateTime(itemReview.reviewCompletedAt)}</span>
            </div>
          )}

          {itemReview.appealedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Appeal Submitted</span>
              <span>{formatDateTime(itemReview.appealedAt)}</span>
            </div>
          )}

          {itemReview.appealReviewStartedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Appeal Review Started</span>
              <span>{formatDateTime(itemReview.appealReviewStartedAt)}</span>
            </div>
          )}

          {itemReview.appealReviewCompletedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Appeal Review Completed</span>
              <span>{formatDateTime(itemReview.appealReviewCompletedAt)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
