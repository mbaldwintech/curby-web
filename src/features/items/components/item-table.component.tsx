'use client';

import {
  buildColumnDef,
  buildEnumFilterComponentOptions,
  CurbyTable,
  CurbyTableProps,
  CurbyTableRef,
  CustomColumnDef
} from '@core/components';
import { ItemStatus } from '@core/enumerations';
import { ItemService } from '@core/services';
import { Item } from '@core/types';
import { ProfileCell } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { Row } from '@tanstack/react-table';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { ItemMediaCell } from './item-media-cell.component';
import { ItemStatusBadge } from './item-status-badge.component';
import { ItemTypeBadge } from './item-type-badge.component';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ItemTableProps extends Omit<CurbyTableProps<Item>, 'service' | 'columns'> {}

export const ItemTable = forwardRef<CurbyTableRef<Item>, ItemTableProps>(function ItemTable(
  props: ItemTableProps,
  ref
) {
  const { ...rest } = props;
  const service = useRef(createClientService(ItemService)).current;

  const buildColumn = useCallback(
    <K extends keyof Item>(key: K, header: string, options?: Partial<CustomColumnDef<Item, Item[K]>>) => {
      return buildColumnDef<Item, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<Item>[] = useMemo(
    () =>
      [
        {
          accessorKey: 'thumbnailId',
          header: 'Image',
          cell: ({ row }: { row: Row<Item> }) => <ItemMediaCell itemId={row.original.id} />,
          enableSorting: false,
          enableColumnFilter: false,
          enableHiding: false
        },
        buildColumn('title', 'Title', { enableHiding: false }),
        buildColumn('type', 'Type', {
          cell: ({ row }) => <ItemTypeBadge type={row.original.type} />
        }),
        buildColumn('postedBy', 'Posted By', {
          cell: ({ row }) => <ProfileCell userId={row.original.postedBy} />,
          enableSorting: false,
          enableColumnFilter: false
        }),
        buildColumn('status', 'Status', {
          cell: ({ row }) => <ItemStatusBadge status={row.original.status} />,
          filterComponentOptions: buildEnumFilterComponentOptions(ItemStatus)
        }),
        buildColumn('taken', 'Taken', {
          cell: ({ row }) => (row.original.taken ? 'Yes' : 'No'),
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
      ].filter((c) => c !== undefined),
    [buildColumn]
  );

  return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
});
