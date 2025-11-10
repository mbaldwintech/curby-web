'use client';

import {
  Badge,
  buildColumnDef,
  buildEnumFilterComponentOptions,
  CurbyTable,
  CurbyTableProps,
  CurbyTableRef,
  CustomColumnDef
} from '@core/components';
import { UserRole, UserStatus } from '@core/enumerations';
import { ProfileService } from '@core/services';
import { Profile } from '@core/types';
import { CurbyCoinBalanceCell } from '@features/curby-coins/components';
import { DeviceCountCell } from '@features/devices/components';
import { ReportedItemCountCell } from '@features/moderation/item-reports/components';
import { createClientService } from '@supa/utils/client';
import { Row } from '@tanstack/react-table';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { FalseTakingsCountCell } from './false-takings-count-cell.component';
import { PostedItemCountCell } from './posted-item-count-cell.component';
import { SavedItemCountCell } from './saved-item-count-cell.component';
import { SubmittedReportsCountCell } from './submitted-reports-count-cell.component';
import { TakenItemCountCell } from './taken-item-count-cell.component';
import { UserStatusBadge } from './user-status-badge.component';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ProfileTableProps extends Omit<CurbyTableProps<Profile>, 'service' | 'columns'> {}

export const ProfileTable = forwardRef<CurbyTableRef<Profile>, ProfileTableProps>(function ProfileTable(
  props: ProfileTableProps,
  ref
) {
  const { ...rest } = props;
  const service = useRef(createClientService(ProfileService)).current;

  const buildColumn = useCallback(
    <K extends keyof Profile>(key: K, header: string, options?: Partial<CustomColumnDef<Profile, Profile[K]>>) => {
      return buildColumnDef<Profile, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<Profile>[] = useMemo(
    () =>
      (
        [
          buildColumn('username', 'Username'),
          buildColumn('role', 'Role', {
            cell: ({ row }) => row.original.role && <Badge variant="outline">{row.original.role}</Badge>,
            enableHiding: false,
            filterComponent: 'distinct',
            filterComponentOptions: {
              getOptions: () => Promise.resolve(Object.values(UserRole))
            }
          }),
          buildColumn('status', 'Status', {
            cell: ({ row }) => <UserStatusBadge status={row.original.status} />,
            filterComponentOptions: buildEnumFilterComponentOptions(UserStatus)
          }),
          {
            accessorKey: 'deviceCount',
            header: 'Device Count',
            cell: ({ row }) => <DeviceCountCell userId={row.original.userId} />,
            enableColumnFilter: false,
            enableSorting: false,
            meta: { justify: 'center' }
          },
          {
            accessorKey: 'curbyCoinBalance',
            header: 'Curby Coins',
            cell: ({ row }) => <CurbyCoinBalanceCell userId={row.original.userId} />,
            enableColumnFilter: false,
            enableSorting: false,
            meta: { justify: 'center' }
          },
          {
            accessorKey: 'savedItemCount',
            header: 'Saved Items',
            cell: ({ row }) => <SavedItemCountCell userId={row.original.userId} />,
            enableColumnFilter: false,
            enableSorting: false,
            meta: { justify: 'center' }
          },
          {
            accessorKey: 'postedItemCount',
            header: 'Posted Items',
            cell: ({ row }) => <PostedItemCountCell userId={row.original.userId} />,
            enableColumnFilter: false,
            enableSorting: false,
            meta: { justify: 'center' }
          },
          {
            accessorKey: 'takenItemCount',
            header: 'Taken Items',
            cell: ({ row }) => <TakenItemCountCell userId={row.original.userId} />,
            enableColumnFilter: false,
            enableSorting: false,
            meta: { justify: 'center' }
          },
          {
            accessorKey: 'falseTakingsCount',
            header: 'False Takings',
            cell: ({ row }) => <FalseTakingsCountCell userId={row.original.userId} />,
            enableColumnFilter: false,
            enableSorting: false,
            meta: { justify: 'center' }
          },
          {
            accessorKey: 'submittedReportsCount',
            header: 'Submitted Reports',
            cell: ({ row }: { row: Row<Profile> }) => <SubmittedReportsCountCell userId={row.original.userId} />,
            enableColumnFilter: false,
            enableSorting: false,
            meta: { justify: 'center' }
          },
          {
            accessorKey: 'reportedItemCount',
            header: 'Reported Items',
            cell: ({ row }) => <ReportedItemCountCell userId={row.original.userId} />,
            enableColumnFilter: false,
            enableSorting: false,
            meta: { justify: 'center' }
          }
        ] as (CustomColumnDef<Profile> | undefined)[]
      ).filter((c) => c !== undefined),
    [buildColumn]
  );

  return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
});
