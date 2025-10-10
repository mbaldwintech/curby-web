'use client';

import { buildColumnDef, CurbyTable, CustomColumnDef } from '@core/components';
import { AdminHeader } from '@core/components/admin-header';
import { Badge } from '@core/components/badge';
import { CurbyCoinBalanceCell } from '@core/components/curby-coin-balance-cell';
import { DeviceCountCell } from '@core/components/device-count-cell';
import { FalseTakingsCountCell } from '@core/components/false-takings-count-cell';
import { PostedItemCountCell } from '@core/components/posted-item-count-cell';
import { ReportedItemCountCell } from '@core/components/reported-item-count-cell';
import { SavedItemCountCell } from '@core/components/saved-item-count-cell';
import { SubmittedReportsCountCell } from '@core/components/submitted-reports-count-cell';
import { TakenItemCountCell } from '@core/components/taken-item-count-cell';
import { UserRole, UserStatus } from '@core/enumerations';
import { ProfileService } from '@core/services';
import { Profile } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';

export default function UsersPage() {
  const router = useRouter();
  const service = useRef(createClientService(ProfileService)).current;

  const buildColumn = useCallback(
    <K extends keyof Profile>(key: K, header: string, options?: Partial<CustomColumnDef<Profile, Profile[K]>>) => {
      return buildColumnDef<Profile, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<Profile>[] = useMemo(
    () => [
      buildColumn('username', 'Username'),
      buildColumn('role', 'Role', {
        cell: ({ row }) =>
          row.original.role && (
            <div className="w-32">
              <Badge variant="outline" className="text-muted-foreground px-1.5">
                {row.original.role}
              </Badge>
            </div>
          ),
        enableHiding: false,
        filterComponent: 'distinct',
        filterComponentOptions: {
          getOptions: () => Promise.resolve(Object.values(UserRole))
        }
      }),
      {
        accessorKey: 'deviceCount',
        header: 'Device Count',
        cell: ({ row }) => <DeviceCountCell userId={row.original.userId} />,
        enableColumnFilter: false,
        enableSorting: false,
        meta: { align: 'center' }
      },
      {
        accessorKey: 'curbyCoinBalance',
        header: 'Curby Coins',
        cell: ({ row }) => <CurbyCoinBalanceCell userId={row.original.userId} />,
        enableColumnFilter: false,
        enableSorting: false,
        meta: { align: 'center' }
      },
      {
        accessorKey: 'savedItemCount',
        header: 'Saved Items',
        cell: ({ row }) => <SavedItemCountCell userId={row.original.userId} />,
        enableColumnFilter: false,
        enableSorting: false,
        meta: { align: 'center' }
      },
      {
        accessorKey: 'postedItemCount',
        header: 'Posted Items',
        cell: ({ row }) => <PostedItemCountCell userId={row.original.userId} />,
        enableColumnFilter: false,
        enableSorting: false,
        meta: { align: 'center' }
      },
      {
        accessorKey: 'takenItemCount',
        header: 'Taken Items',
        cell: ({ row }) => <TakenItemCountCell userId={row.original.userId} />,
        enableColumnFilter: false,
        enableSorting: false,
        meta: { align: 'center' }
      },
      {
        accessorKey: 'falseTakingsCount',
        header: 'False Takings',
        cell: ({ row }) => <FalseTakingsCountCell userId={row.original.userId} />,
        enableColumnFilter: false,
        enableSorting: false,
        meta: { align: 'center' }
      },
      {
        accessorKey: 'submittedReportsCount',
        header: 'Submitted Reports',
        cell: ({ row }) => <SubmittedReportsCountCell userId={row.original.userId} />,
        enableColumnFilter: false,
        enableSorting: false,
        meta: { align: 'center' }
      },
      {
        accessorKey: 'reportedItemCount',
        header: 'Reported Items',
        cell: ({ row }) => <ReportedItemCountCell userId={row.original.userId} />,
        enableColumnFilter: false,
        enableSorting: false,
        meta: { align: 'center' }
      },
      buildColumn('status', 'Status', {
        cell: ({ row }) =>
          row.original.status && (
            <div className="w-32">
              <Badge variant="outline" className="text-muted-foreground px-1.5">
                {row.original.status}
              </Badge>
            </div>
          ),
        filterComponent: 'distinct',
        filterComponentOptions: {
          getOptions: () => Promise.resolve(Object.values(UserStatus))
        }
      })
    ],
    [buildColumn]
  );

  return (
    <>
      <AdminHeader title="Users" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
        <CurbyTable
          service={service}
          columns={columns}
          height={500}
          onRowClick={(user) => {
            router.push(`/admin/users/${user.id}`);
          }}
          rowActionSections={[
            [
              {
                label: 'View Details',
                icon: <InfoIcon size={14} />,
                onClick: (user) => {
                  router.push(`/admin/users/${user.id}`);
                }
              }
            ]
          ]}
        />
      </div>
    </>
  );
}
