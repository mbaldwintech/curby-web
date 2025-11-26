'use client';

import { buildColumnDef, CurbyTable, CurbyTableProps, CurbyTableRef, CustomColumnDef } from '@core/components';
import { BroadcastDeliveryViewService } from '@core/services';
import { BroadcastDeliveryView } from '@core/types';
import { DeviceCell } from '@features/devices/components';
import { ProfileCell } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { format } from 'date-fns';
import { forwardRef, useCallback, useMemo, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BroadcastDeliveryViewTableProps
  extends Omit<CurbyTableProps<BroadcastDeliveryView>, 'service' | 'columns'> {}

export const BroadcastDeliveryViewTable = forwardRef<
  CurbyTableRef<BroadcastDeliveryView>,
  BroadcastDeliveryViewTableProps
>(function BroadcastDeliveryViewTable(props: BroadcastDeliveryViewTableProps, ref) {
  const { ...rest } = props;
  const service = useRef(createClientService(BroadcastDeliveryViewService)).current;

  const buildColumn = useCallback(
    <K extends keyof BroadcastDeliveryView>(
      key: K,
      header: string,
      options?: Partial<CustomColumnDef<BroadcastDeliveryView, BroadcastDeliveryView[K]>>
    ) => {
      return buildColumnDef<BroadcastDeliveryView, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<BroadcastDeliveryView>[] = useMemo(
    () =>
      [
        buildColumn('userId', 'User', { cell: ({ row }) => <ProfileCell userId={row.original.userId} /> }),
        buildColumn('deviceId', 'Device', {
          cell: ({ row }) => <DeviceCell deviceId={row.original.deviceId} />
        }),
        buildColumn('viewedAt', 'Viewed At', {
          cell: ({ row }) => (row.original.viewedAt ? format(new Date(row.original.viewedAt), 'PPpp') : '')
        }),
        buildColumn('dismissedAt', 'Dismissed At', {
          cell: ({ row }) => (row.original.dismissedAt ? format(new Date(row.original.dismissedAt), 'PPpp') : '')
        }),
        buildColumn('clickedAt', 'Clicked At', {
          cell: ({ row }) => (row.original.clickedAt ? format(new Date(row.original.clickedAt), 'PPpp') : '')
        })
      ].filter((c) => c !== undefined),
    [buildColumn]
  );

  return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
});
