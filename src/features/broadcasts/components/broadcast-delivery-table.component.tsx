'use client';

import {
  buildColumnDef,
  buildEnumFilterComponentOptions,
  CurbyTable,
  CurbyTableProps,
  CurbyTableRef,
  CustomColumnDef
} from '@core/components';
import { BroadcastDeliveryStatus } from '@core/enumerations';
import { BroadcastDeliveryService } from '@core/services';
import { BroadcastDelivery } from '@core/types';
import { ProfileCell } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { format } from 'date-fns';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { BroadcastDeliveryStatusBadge } from './broadcast-delivery-status-badge.component';
import { ScheduleCell } from './schedule-cell.component';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BroadcastDeliveryTableProps extends Omit<CurbyTableProps<BroadcastDelivery>, 'service' | 'columns'> {}

export const BroadcastDeliveryTable = forwardRef<CurbyTableRef<BroadcastDelivery>, BroadcastDeliveryTableProps>(
  function BroadcastDeliveryTable(props: BroadcastDeliveryTableProps, ref) {
    const { ...rest } = props;
    const service = useRef(createClientService(BroadcastDeliveryService)).current;

    const buildColumn = useCallback(
      <K extends keyof BroadcastDelivery>(
        key: K,
        header: string,
        options?: Partial<CustomColumnDef<BroadcastDelivery, BroadcastDelivery[K]>>
      ) => {
        return buildColumnDef<BroadcastDelivery, K>(key, header, service, options);
      },
      [service]
    );

    const columns: CustomColumnDef<BroadcastDelivery>[] = useMemo(
      () =>
        [
          buildColumn('scheduleId', 'Schedule', {
            enableHiding: false,
            cell: ({ row }) =>
              row.original.scheduleId ? <ScheduleCell scheduleId={row.original.scheduleId} /> : 'One-time'
          }),
          buildColumn('scheduledFor', 'Scheduled For', {
            cell: ({ row }) => (row.original.scheduledFor ? format(new Date(row.original.scheduledFor), 'PPpp') : '')
          }),
          buildColumn('status', 'Status', {
            filterComponentOptions: buildEnumFilterComponentOptions(BroadcastDeliveryStatus),
            cell: ({ row }) => <BroadcastDeliveryStatusBadge status={row.original.status} />
          }),
          buildColumn('sentAt', 'Sent At', {
            cell: ({ row }) => (row.original.sentAt ? format(new Date(row.original.sentAt), 'PPpp') : '')
          }),
          buildColumn('error', 'Error', {
            cell: ({ row }) => <span className="text-destructive">{row.original.error || ''}</span>
          }),
          buildColumn('createdBy', 'Created By', {
            cell: ({ row }) => <ProfileCell userId={row.original.createdBy} />
          })
        ].filter((c) => c !== undefined),
      [buildColumn]
    );

    return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
  }
);
