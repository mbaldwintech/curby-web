'use client';

import { CustomColumnDef } from '@common/components';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { ExtendedEventService } from '../../services';
import { ExtendedEvent } from '../../types';
import { DeviceCell, ProfileCell } from '../cells';
import { buildColumnDef, CurbyTable, CurbyTableProps, CurbyTableRef } from '../curby-table';

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
          meta: { align: 'center' },
          enableColumnFilter: false
        }),
        buildColumn('curbyCoinTransactionCount', 'Curby Coin Awards', {
          meta: { align: 'center' },
          enableColumnFilter: false
        }),
        ...extraColumns
      ],
      [buildColumn, extraColumns]
    );

    return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
  }
);
