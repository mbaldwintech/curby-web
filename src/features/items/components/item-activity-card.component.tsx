import { Card, CardContent, CardHeader, CardTitle } from '@core/components';
import { ItemActivityTable } from './item-activity-table.component';

export const ItemActivityCard = ({ itemId }: { itemId: string }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Item Activity Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <ItemActivityTable itemId={itemId} />
      </CardContent>
    </Card>
  );
};
