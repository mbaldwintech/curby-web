'use client';

import { Badge, CustomColumnDef } from '@common/components';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { ItemService } from '../../services';
import { Item } from '../../types';
import { ItemMediaCell, ProfileCell } from '../cells';
import { buildColumnDef, CurbyTable, CurbyTableProps, CurbyTableRef } from '../curby-table';

export interface ItemTableProps extends Omit<CurbyTableProps<Item>, 'service' | 'columns'> {
  extraColumns?: CustomColumnDef<Item>[];
}

export const ItemTable = forwardRef<CurbyTableRef<Item>, ItemTableProps>(function ItemTable(
  props: ItemTableProps,
  ref
) {
  const { extraColumns = [], ...rest } = props;
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
      }),
      ...extraColumns
    ],
    [buildColumn, extraColumns]
  );

  return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
});
