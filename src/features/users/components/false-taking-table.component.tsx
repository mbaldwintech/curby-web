'use client';

import { buildColumnDef, CurbyTable, CurbyTableProps, CurbyTableRef, CustomColumnDef } from '@core/components';
import { FalseTakingService } from '@core/services';
import { FalseTaking } from '@core/types';
import { formatDateTime } from '@core/utils';
import { ItemMediaCell } from '@features/items/components';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { ProfileCell } from './profile-cell.component';

export interface FalseTakingTableProps extends Omit<CurbyTableProps<FalseTaking>, 'service' | 'columns'> {
  extraColumns?: CustomColumnDef<FalseTaking>[];
}

export const FalseTakingTable = forwardRef<CurbyTableRef<FalseTaking>, FalseTakingTableProps>(function FalseTakingTable(
  props: FalseTakingTableProps,
  ref
) {
  const { extraColumns = [], ...rest } = props;
  const service = useRef(createClientService(FalseTakingService)).current;

  const buildColumn = useCallback(
    <K extends keyof FalseTaking>(
      key: K,
      header: string,
      options?: Partial<CustomColumnDef<FalseTaking, FalseTaking[K]>>
    ) => {
      return buildColumnDef<FalseTaking, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<FalseTaking>[] = useMemo(
    () => [
      buildColumn('itemId', 'Item', {
        cell: ({ row }) => <ItemMediaCell itemId={row.original.itemId} />,
        enableSorting: false,
        enableColumnFilter: false,
        enableHiding: false
      }),
      buildColumn('takerId', 'Taker', {
        cell: ({ row }) => <ProfileCell userId={row.original.takerId} />,
        enableSorting: false,
        enableColumnFilter: false
      }),
      buildColumn('takenAt', 'Marked Taken At', {
        cell: ({ row }) => formatDateTime(row.original.takenAt),
        enableColumnFilter: false
      }),
      buildColumn('restoredAt', 'Restored At', {
        cell: ({ row }) => formatDateTime(row.original.restoredAt),
        enableColumnFilter: false
      }),
      ...extraColumns
    ],
    [buildColumn, extraColumns]
  );

  return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
});
