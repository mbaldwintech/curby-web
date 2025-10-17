'use client';

import { CustomColumnDef } from '@common/components';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { NotificationService } from '../../services';
import { Notification } from '../../types';
import { CurbyCoinTransactionCell, DeviceCell, EventCell, NotificationTemplateCell, ProfileCell } from '../cells';
import { buildColumnDef, CurbyTable, CurbyTableProps, CurbyTableRef } from '../curby-table';

export interface NotificationTableProps extends Omit<CurbyTableProps<Notification>, 'service' | 'columns'> {
  extraColumns?: CustomColumnDef<Notification>[];
}

export const NotificationTable = forwardRef<CurbyTableRef<Notification>, NotificationTableProps>(
  function NotificationTable(props: NotificationTableProps, ref) {
    const { extraColumns = [], ...rest } = props;
    const service = useRef(createClientService(NotificationService)).current;

    const buildColumn = useCallback(
      <K extends keyof Notification>(
        key: K,
        header: string,
        options?: Partial<CustomColumnDef<Notification, Notification[K]>>
      ) => {
        return buildColumnDef<Notification, K>(key, header, service, options);
      },
      [service]
    );

    const columns: CustomColumnDef<Notification>[] = useMemo(
      () => [
        buildColumn('sentAt', 'Sent At', {
          cell: ({ row }) => new Date(row.original.sentAt).toLocaleString()
        }),
        buildColumn('userId', 'Target User', {
          cell: ({ row }) => <ProfileCell userId={row.original.userId} />
        }),
        buildColumn('deviceId', 'Target Device', {
          cell: ({ row }) => <DeviceCell deviceId={row.original.deviceId} />
        }),
        buildColumn('eventId', 'Triggered By Event', {
          cell: ({ row }) => <EventCell eventId={row.original.eventId} />
        }),
        buildColumn('curbyCoinTransactionId', 'Triggered By Transaction', {
          cell: ({ row }) => <CurbyCoinTransactionCell curbyCoinTransactionId={row.original.curbyCoinTransactionId} />
        }),
        buildColumn('notificationTemplateId', 'Template', {
          cell: ({ row }) => <NotificationTemplateCell notificationTemplateId={row.original.notificationTemplateId} />
        }),
        buildColumn('category', 'Category'),
        buildColumn('deliveryChannel', 'Delivery Channel'),
        ...extraColumns
      ],
      [buildColumn, extraColumns]
    );

    return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
  }
);
