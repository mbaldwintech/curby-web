'use client';

import { Badge, buildColumnDef, CurbyTable, CustomColumnDef } from '@core/components';
import { AdminHeader } from '@core/components/admin-header';
import { ItemMediaCell } from '@core/components/item-media-cell';
import { ProfileCell } from '@core/components/profile-cell';
import { ItemService } from '@core/services';
import { Item } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';

export default function ItemsPage() {
  const router = useRouter();
  const service = useRef(createClientService(ItemService)).current;

  const buildColumn = useCallback(
    <K extends keyof Item>(key: K, header: string, options?: Partial<CustomColumnDef<Item, Item[K]>>) => {
      return buildColumnDef<Item, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<Item>[] = useMemo(
    () => [
      {
        accessorKey: 'thumbnailId',
        header: 'Image',
        cell: ({ row }) => <ItemMediaCell itemId={row.original.id} />,
        enableSorting: false,
        enableColumnFilter: false,
        enableHiding: false
      },
      buildColumn('title', 'Title', { enableHiding: false }),
      buildColumn('type', 'Type', {
        cell: ({ row }) => (
          <div className="w-32">
            <Badge variant="outline" className="text-muted-foreground px-1.5">
              {row.original.type}
            </Badge>
          </div>
        )
      }),
      buildColumn('postedBy', 'Posted By', {
        cell: ({ row }) => <ProfileCell userId={row.original.postedBy} />,
        enableSorting: false,
        enableColumnFilter: false
      }),
      buildColumn('taken', 'Status', {
        cell: ({ row }) =>
          row.original.taken ? (
            <Badge variant="destructive" className="text-foreground px-1.5">
              Taken
            </Badge>
          ) : (
            <Badge variant="default" className="text-foreground px-1.5">
              Available
            </Badge>
          ),
        enableSorting: false,
        enableColumnFilter: false
      }),
      buildColumn('takenBy', 'Taken By', {
        cell: ({ row }) => <ProfileCell userId={row.original.takenBy} />,
        enableSorting: false,
        enableColumnFilter: false
      }),
      buildColumn('confirmedTakenAt', 'Confirmed', {
        cell: ({ row }) => (row.original.taken ? (row.original.confirmedTakenAt ? 'Yes' : 'No') : null),
        enableSorting: false,
        enableColumnFilter: false
      }),
      buildColumn('expiresAt', 'Expires At', {
        cell: ({ row }) => (!row.original.taken ? new Date(row.original.expiresAt).toLocaleString() : null),
        enableSorting: false,
        enableColumnFilter: false
      })
    ],
    [buildColumn]
  );

  return (
    <>
      <AdminHeader title="Items" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
        <CurbyTable
          service={service}
          columns={columns}
          height={500}
          onRowClick={(item) => {
            router.push(`/admin/items/${item.id}`);
          }}
          rowActionSections={[
            [
              {
                label: 'View Details',
                icon: <InfoIcon size={14} />,
                onClick: (item) => {
                  router.push(`/admin/items/${item.id}`);
                }
              }
            ]
          ]}
        />
      </div>
    </>
  );
}
