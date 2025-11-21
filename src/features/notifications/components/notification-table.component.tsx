'use client';

import { buildColumnDef, CurbyTable, CurbyTableProps, CurbyTableRef, CustomColumnDef } from '@core/components';
import { NotificationService } from '@core/services';
import { Notification } from '@core/types';
import { CurbyCoinTransactionCell } from '@features/curby-coins/components';
import { DeviceCell } from '@features/devices/components';
import { EventCell } from '@features/events/components';
import { ProfileCell } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { NotificationTemplateCell } from './notification-template-cell.component';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NotificationTableProps extends Omit<CurbyTableProps<Notification>, 'service' | 'columns'> {}

export const NotificationTable = forwardRef<CurbyTableRef<Notification>, NotificationTableProps>(
  function NotificationTable(props: NotificationTableProps, ref) {
    const { ...rest } = props;
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
      () =>
        [
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
          buildColumn('deliveryChannel', 'Delivery Channel')
        ].filter((c) => c !== undefined),
      [buildColumn]
    );

    return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
  }
);
