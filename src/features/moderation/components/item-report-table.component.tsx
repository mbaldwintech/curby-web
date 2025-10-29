'use client';

import { buildColumnDef, CurbyTable, CurbyTableProps, CurbyTableRef, CustomColumnDef } from '@core/components';
import { ItemReportService } from '@core/services';
import { ItemReport } from '@core/types';
import { ItemMediaCell } from '@features/items/components';
import { ProfileCell } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { ItemReviewCell } from './item-review-cell.component';

export interface ItemReportTableProps extends Omit<CurbyTableProps<ItemReport>, 'service' | 'columns'> {
  extraColumns?: CustomColumnDef<ItemReport>[];
}

export const ItemReportTable = forwardRef<CurbyTableRef<ItemReport>, ItemReportTableProps>(function ItemReportTable(
  props: ItemReportTableProps,
  ref
) {
  const { extraColumns = [], ...rest } = props;
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

  return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
});
