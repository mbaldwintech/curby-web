import { Card, CardContent, CardHeader, CardTitle } from '@core/components';
import { UserReview } from '@core/types';
import { formatDateTime } from '@core/utils';
import { Calendar } from 'lucide-react';

export const UserReviewTimelineCard = ({ userReview }: { userReview: UserReview }) => {
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
            <span>{formatDateTime(userReview.createdAt)}</span>
          </div>

          {userReview.reviewStartedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Review Started</span>
              <span>{formatDateTime(userReview.reviewStartedAt)}</span>
            </div>
          )}

          {userReview.reviewCompletedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Review Completed</span>
              <span>{formatDateTime(userReview.reviewCompletedAt)}</span>
            </div>
          )}

          {userReview.appealedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Appeal Submitted</span>
              <span>{formatDateTime(userReview.appealedAt)}</span>
            </div>
          )}

          {userReview.appealReviewStartedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Appeal Review Started</span>
              <span>{formatDateTime(userReview.appealReviewStartedAt)}</span>
            </div>
          )}

          {userReview.appealReviewCompletedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Appeal Review Completed</span>
              <span>{formatDateTime(userReview.appealReviewCompletedAt)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
