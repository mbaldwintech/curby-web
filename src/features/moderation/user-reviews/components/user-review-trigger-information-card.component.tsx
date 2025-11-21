import { Card, CardContent, CardHeader, CardTitle, Label } from '@core/components';
import { UserReview } from '@core/types';
import { Flag } from 'lucide-react';

export interface UserReviewTriggerInformationCardProps {
  userReview: UserReview;
}

export const UserReviewTriggerInformationCard = ({ userReview }: UserReviewTriggerInformationCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="h-5 w-5" />
          Trigger Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Trigger Type</Label>
          <p className="text-sm text-muted-foreground capitalize">{userReview.triggerType.replace('_', ' ')}</p>
        </div>
        {userReview.triggerReason && (
          <div>
            <Label className="text-sm font-medium">Trigger Reason</Label>
            <p className="text-sm text-muted-foreground">{userReview.triggerReason}</p>
          </div>
        )}
        <div>
          <Label className="text-sm font-medium">Trigger Data</Label>
          <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-32">
            {JSON.stringify(userReview.triggerData, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};
