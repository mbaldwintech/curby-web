import { Card, CardContent, CardHeader, CardTitle, Label } from '@core/components';
import { ItemReview } from '@core/types';
import { formatDateTime } from '@core/utils';
import { AlertCircle } from 'lucide-react';

export const ItemReviewAppealInformationCard = ({ itemReview }: { itemReview: ItemReview }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Appeal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Appeal Reason</Label>
          <p className="text-sm text-muted-foreground">{itemReview.appealReason}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Appealed By</Label>
            <p className="text-sm text-muted-foreground">{itemReview.appealedBy || 'Unknown'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Appealed On</Label>
            <p className="text-sm text-muted-foreground">{formatDateTime(itemReview.appealedAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
