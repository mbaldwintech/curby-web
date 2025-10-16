'use client';

import { CustomColumnDef } from '@common/components';
import { formatDateTime } from '@common/utils';
import { Filters } from '@supa/services';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { FalseTakingService } from '../../services';
import { FalseTaking } from '../../types';
import { ItemMediaCell, ProfileCell } from '../cells';
import { buildColumnDef, CurbyTable, CurbyTableRef, CurbyTableRowAction } from '../curby-table';

export interface FalseTakingTableProps {
  defaultFilters?: Filters<FalseTaking>;
  onRowClick?: (falseTaking: FalseTaking) => void;
  rowActionSections?: CurbyTableRowAction<FalseTaking>[][];
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  height?: number;
  maxHeight?: number;
  extraColumns?: CustomColumnDef<FalseTaking>[];
}

export const FalseTakingTable = forwardRef<CurbyTableRef<FalseTaking>, FalseTakingTableProps>(function FalseTakingTable(
  {
    defaultFilters,
    onRowClick,
    rowActionSections,
    toolbarLeft,
    toolbarRight,
    height = 500,
    maxHeight,
    extraColumns = []
  }: FalseTakingTableProps,
  ref
) {
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

  return (
    <CurbyTable
      ref={ref}
      service={service}
      defaultFilters={defaultFilters}
      columns={columns}
      height={height}
      maxHeight={maxHeight}
      onRowClick={onRowClick}
      rowActionSections={rowActionSections}
      toolbarLeft={toolbarLeft}
      toolbarRight={toolbarRight}
    />
  );
});
