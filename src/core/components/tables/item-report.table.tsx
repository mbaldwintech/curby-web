'use client';

import { CustomColumnDef } from '@common/components';
import { Filters } from '@supa/services';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { ItemReportService } from '../../services';
import { ItemReport } from '../../types';
import { ItemMediaCell, ItemReviewCell, ProfileCell } from '../cells';
import { buildColumnDef, CurbyTable, CurbyTableRef, CurbyTableRowAction } from '../curby-table';

export interface ItemReportTableProps {
  defaultFilters?: Filters<ItemReport>;
  onRowClick?: (itemReport: ItemReport) => void;
  rowActionSections?: CurbyTableRowAction<ItemReport>[][];
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  height?: number;
  maxHeight?: number;
  extraColumns?: CustomColumnDef<ItemReport>[];
}

export const ItemReportTable = forwardRef<CurbyTableRef<ItemReport>, ItemReportTableProps>(function ItemReportTable(
  {
    defaultFilters,
    onRowClick,
    rowActionSections,
    toolbarLeft,
    toolbarRight,
    height = 500,
    maxHeight,
    extraColumns = []
  }: ItemReportTableProps,
  ref
) {
  const service = useRef(createClientService(ItemReportService)).current;

  const buildColumn = useCallback(
    <K extends keyof ItemReport>(
      key: K,
      header: string,
      options?: Partial<CustomColumnDef<ItemReport, ItemReport[K]>>
    ) => {
      return buildColumnDef<ItemReport, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<ItemReport>[] = useMemo(
    () => [
      buildColumn('itemId', 'Item', {
        cell: ({ row }) => <ItemMediaCell itemId={row.original.itemId} />
      }),
      buildColumn('reporterId', 'Reporter', {
        cell: ({ row }) => <ProfileCell userId={row.original.reporterId} />
      }),
      buildColumn('reportedAt', 'Reported At', {
        cell: ({ row }) => new Date(row.original.reportedAt).toLocaleString()
      }),
      buildColumn('reason', 'Reason', {
        cell: ({ row }) => row.original.reason || '-'
      }),
      buildColumn('reviewId', 'Review', {
        cell: ({ row }) => <ItemReviewCell itemReviewId={row.original.reviewId} />
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
