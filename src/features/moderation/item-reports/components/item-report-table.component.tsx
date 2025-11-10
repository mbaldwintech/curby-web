'use client';

import { buildColumnDef, CurbyTable, CurbyTableProps, CurbyTableRef, CustomColumnDef } from '@core/components';
import { ItemReportService } from '@core/services';
import { ItemReport } from '@core/types';
import { ItemMediaCell } from '@features/items/components';
import { ItemReviewCell } from '@features/moderation/item-reviews/components';
import { ProfileCell } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ItemReportTableProps extends Omit<CurbyTableProps<ItemReport>, 'service' | 'columns'> {}

export const ItemReportTable = forwardRef<CurbyTableRef<ItemReport>, ItemReportTableProps>(function ItemReportTable(
  props: ItemReportTableProps,
  ref
) {
  const { ...rest } = props;
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
    () =>
      [
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
        })
      ].filter((c) => c !== undefined),
    [buildColumn]
  );

  return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
});
