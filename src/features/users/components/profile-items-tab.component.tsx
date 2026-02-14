'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@core/components';
import { Item, Profile, SavedItem, UserDevice } from '@core/types';
import { formatDateTime } from '@core/utils';
import { DeviceTable } from '@features/devices/components';
import { ItemTable } from '@features/items/components';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface ProfileItemsTabProps {
  profile: Profile;
  userDevices: UserDevice[];
  savedItems: SavedItem[];
}

export function ProfileItemsTab({ profile, userDevices, savedItems }: ProfileItemsTabProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {/* Devices Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Devices this user has logged in from (click a row to view device details)
          </div>
          <div className="flex flex-col gap-2">
            <DeviceTable
              restrictiveFilters={[{ column: 'id', operator: 'in', value: userDevices.map((ud) => ud.deviceId) }]}
              extraColumns={[
                {
                  accessorKey: 'lastSeenAt',
                  header: 'Last Seen',
                  cell: ({ row }) => {
                    const ud = userDevices.find((ud) => row.original.id === ud.deviceId);
                    return ud?.lastSeenAt ? formatDateTime(ud.lastSeenAt) : 'Never';
                  },
                  enableColumnFilter: false,
                  enableSorting: false,
                  enableSearching: false
                },
                {
                  accessorKey: 'lastLogin',
                  header: 'Last Login',
                  cell: ({ row }) => {
                    const ud = userDevices.find((ud) => row.original.id === ud.deviceId);
                    return ud?.lastLogin ? formatDateTime(ud.lastLogin) : 'Never';
                  },
                  enableColumnFilter: false,
                  enableSorting: false,
                  enableSearching: false
                },
                {
                  accessorKey: 'lastLogout',
                  header: 'Last Logout',
                  cell: ({ row }) => {
                    const ud = userDevices.find((ud) => row.original.id === ud.deviceId);
                    return ud?.lastLogout ? formatDateTime(ud.lastLogout) : 'Never';
                  },
                  enableColumnFilter: false,
                  enableSorting: false,
                  enableSearching: false
                }
              ]}
              onRowClick={(row) => {
                router.push(`/admin/devices/${row.id}`);
              }}
              getRowActionMenuItems={() => [
                {
                  label: 'View details',
                  icon: InfoIcon,
                  onClick: (row) => {
                    router.push(`/admin/devices/${row.id}`);
                  }
                }
              ]}
              maxHeight={300}
            />
          </div>
        </CardContent>
      </Card>

      {/* Items Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-2">
            Items this user has posted (click a row to view item details)
          </div>
          <div className="flex flex-col gap-2">
            <ItemTable
              restrictiveFilters={[{ column: 'postedBy', operator: 'eq', value: profile.userId }]}
              onRowClick={(row) => {
                router.push(`/admin/items/${row.id}`);
              }}
              getRowActionMenuItems={() => [
                {
                  label: 'View details',
                  icon: InfoIcon,
                  onClick: (row) => {
                    router.push(`/admin/item/${row.id}`);
                  }
                }
              ]}
              maxHeight={300}
            />
          </div>
        </CardContent>
      </Card>

      {/* Saved Items Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Saved Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-2">
            Items this user has saved (click a row to view item details)
          </div>
          <div className="flex flex-col gap-2">
            <ItemTable
              restrictiveFilters={[{ column: 'id', operator: 'in', value: savedItems.map((si) => si.itemId) }]}
              onRowClick={(row) => {
                router.push(`/admin/items/${row.id}`);
              }}
              getRowActionMenuItems={() => [
                {
                  label: 'View details',
                  icon: InfoIcon,
                  onClick: (row) => {
                    router.push(`/admin/item/${row.id}`);
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
