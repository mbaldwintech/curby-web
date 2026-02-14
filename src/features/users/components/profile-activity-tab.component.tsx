'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@core/components';
import { Profile } from '@core/types';
import { CurbyCoinTransactionTable } from '@features/curby-coins/components';
import { ExtendedEventTable } from '@features/events/components';
import { ItemReportTable } from '@features/moderation/item-reports/components';
import { NotificationTable } from '@features/notifications/components';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FalseTakingTable } from './false-taking-table.component';

export interface ProfileActivityTabProps {
  profile: Profile;
}

export function ProfileActivityTab({ profile }: ProfileActivityTabProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">False Takings</CardTitle>
          <div className="text-sm text-muted-foreground mb-2">
            Items this user has falsely taken (click a row to view item details)
          </div>
        </CardHeader>
        <CardContent>
          <FalseTakingTable
            restrictiveFilters={[{ column: 'takerId', operator: 'eq', value: profile.userId }]}
            onRowClick={(row) => {
              router.push(`/admin/items/${row.original.itemId}`);
            }}
            getRowActionMenuItems={() => [
              {
                label: 'View Item Details',
                icon: InfoIcon,
                onClick: (row) => {
                  router.push(`/admin/items/${row.original.itemId}`);
                }
              }
            ]}
            maxHeight={300}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Events</CardTitle>
          <div className="text-sm text-muted-foreground mb-2">
            Events this user has triggered (click a row to view event details)
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <ExtendedEventTable
              restrictiveFilters={[{ column: 'userId', operator: 'eq', value: profile.userId }]}
              onRowClick={(row) => {
                router.push(`/admin/events/${row.id}`);
              }}
              getRowActionMenuItems={() => [
                {
                  label: 'View details',
                  icon: InfoIcon,
                  onClick: (row) => {
                    router.push(`/admin/events/${row.id}`);
                  }
                }
              ]}
              maxHeight={300}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Curby Coins</CardTitle>
          <div className="text-sm text-muted-foreground mb-2">
            Curby Coin transactions for this user (click a row to view transaction details)
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <CurbyCoinTransactionTable
              restrictiveFilters={[{ column: 'userId', operator: 'eq', value: profile.userId }]}
              onRowClick={(row) => {
                router.push(`/admin/transactions/${row.id}`);
              }}
              getRowActionMenuItems={() => [
                {
                  label: 'View details',
                  icon: InfoIcon,
                  onClick: (row) => {
                    router.push(`/admin/transactions/${row.id}`);
                  }
                }
              ]}
              maxHeight={300}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <div className="text-sm text-muted-foreground mb-2">
            Notifications sent to this user (click a row to view notification details)
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <NotificationTable
              restrictiveFilters={[{ column: 'userId', operator: 'eq', value: profile.userId }]}
              onRowClick={(row) => {
                router.push(`/admin/notifications/${row.id}`);
              }}
              getRowActionMenuItems={() => [
                {
                  label: 'View details',
                  icon: InfoIcon,
                  onClick: (row) => {
                    router.push(`/admin/notifications/${row.id}`);
                  }
                }
              ]}
              maxHeight={300}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Submitted Item Reports</CardTitle>
          <div className="text-sm text-muted-foreground mb-2">
            Item reports made by this user (click a row to view report details)
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <ItemReportTable
              restrictiveFilters={[{ column: 'reporterId', operator: 'eq', value: profile.userId }]}
              onRowClick={(row) => {
                router.push(`/admin/moderation/item-reviews/${row.id}`);
              }}
              getRowActionMenuItems={() => [
                {
                  label: 'View details',
                  icon: InfoIcon,
                  onClick: (row) => {
                    router.push(`/admin/moderation/item-reviews/${row.id}`);
                  }
                }
              ]}
              maxHeight={300}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
