'use client';

import { AdminPageContainer } from '@core/components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@core/components/base';
import { BroadcastDeliveryCalendar } from '@features/broadcasts/components';

export default function BroadcastDetailsPage() {
  return (
    <AdminPageContainer title="Broadcast Delivery Calendar">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1">
            <CardTitle>Broadcast Delivery Calendar</CardTitle>
            <CardDescription>Visual calendar view of broadcast deliveries.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <BroadcastDeliveryCalendar />
        </CardContent>
      </Card>
    </AdminPageContainer>
  );
}
