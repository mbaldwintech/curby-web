'use client';

import { Badge, CustomColumnDef } from '@common/components';
import { UserRole, UserStatus } from '@core/enumerations';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { ProfileService } from '../../services';
import { Profile } from '../../types';
import {
  CurbyCoinBalanceCell,
  DeviceCountCell,
  FalseTakingsCountCell,
  PostedItemCountCell,
  ReportedItemCountCell,
  SavedItemCountCell,
  SubmittedReportsCountCell,
  TakenItemCountCell
} from '../cells';
import { buildColumnDef, CurbyTable, CurbyTableProps, CurbyTableRef } from '../curby-table';

export interface ProfileTableProps extends Omit<CurbyTableProps<Profile>, 'service' | 'columns'> {
  extraColumns?: CustomColumnDef<Profile>[];
}

export const ProfileTable = forwardRef<CurbyTableRef<Profile>, ProfileTableProps>(function ProfileTable(
  props: ProfileTableProps,
  ref
) {
  const { extraColumns = [], ...rest } = props;
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
      }),
      ...extraColumns
    ],
    [buildColumn, extraColumns]
  );

  return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
});
