'use client';

import { buildColumnDef, CurbyTable, CurbyTableProps, CurbyTableRef, CustomColumnDef } from '@core/components';
import { ExtendedEventService } from '@core/services';
import { ExtendedEvent } from '@core/types';
import { DeviceCell } from '@features/devices/components';
import { ProfileCell } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';

export interface ExtendedEventTableProps extends Omit<CurbyTableProps<ExtendedEvent>, 'service' | 'columns'> {
  extraColumns?: CustomColumnDef<ExtendedEvent>[];
}

export const ExtendedEventTable = forwardRef<CurbyTableRef<ExtendedEvent>, ExtendedEventTableProps>(
  function ExtendedEventTable(props: ExtendedEventTableProps, ref) {
    const { extraColumns = [], ...rest } = props;
    const service = useRef(createClientService(ExtendedEventService)).current;

    const buildColumn = useCallback(
      <K extends keyof ExtendedEvent>(
        key: K,
        header: string,
        options?: Partial<CustomColumnDef<ExtendedEvent, ExtendedEvent[K]>>
      ) => {
        return buildColumnDef<ExtendedEvent, K>(key, header, service, options);
      },
      [service]
    );

    const columns: CustomColumnDef<ExtendedEvent>[] = useMemo(
      () => [
        buildColumn('createdAt', 'Timestamp', { cell: ({ row }) => new Date(row.original.createdAt).toLocaleString() }),
        buildColumn('eventKey', 'Event Key', { enableHiding: false }),
        buildColumn('eventTypeName', 'Name'),
        buildColumn('eventTypeCategory', 'Category'),
        buildColumn('username', 'User', {
          cell: ({ row }) => <ProfileCell userId={row.original.userId} />
        }),
        buildColumn('persistentDeviceId', 'Device ID', {
          cell: ({ row }) => <DeviceCell deviceId={row.original.systemDeviceId} />
        }),
        buildColumn('notificationCount', 'Notifications', {
          meta: { justify: 'center' },
          enableColumnFilter: false
        }),
        buildColumn('curbyCoinTransactionCount', 'Curby Coin Awards', {
          meta: { justify: 'center' },
          enableColumnFilter: false
        }),
        ...extraColumns
      ],
      [buildColumn, extraColumns]
    );

    return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
  }
);
