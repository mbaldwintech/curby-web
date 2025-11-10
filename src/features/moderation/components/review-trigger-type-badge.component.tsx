import { Badge } from '@core/components';
import { ReviewTriggerType } from '@core/enumerations';

export const ReviewTriggerTypeBadge = ({ type }: { type: ReviewTriggerType }) => {
  switch (type) {
    case ReviewTriggerType.AutoFlag:
      return <Badge variant="outline">Auto Flagged</Badge>;
    case ReviewTriggerType.Manual:
      return <Badge variant="outline">Manual</Badge>;
    case ReviewTriggerType.Reports:
      return <Badge variant="outline">Reported</Badge>;
    default:
      return <>{type}</>;
  }
};
