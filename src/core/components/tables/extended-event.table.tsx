'use client';

import { CustomColumnDef } from '@common/components';
import { Filters } from '@supa/services';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { ExtendedEventService } from '../../services';
import { ExtendedEvent } from '../../types';
import { DeviceCell, ProfileCell } from '../cells';
import { buildColumnDef, CurbyTable, CurbyTableRef, CurbyTableRowAction } from '../curby-table';

export interface ExtendedEventTableProps {
  defaultFilters?: Filters<ExtendedEvent>;
  onRowClick?: (extendedEvent: ExtendedEvent) => void;
  rowActionSections?: CurbyTableRowAction<ExtendedEvent>[][];
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  height?: number;
  maxHeight?: number;
  extraColumns?: CustomColumnDef<ExtendedEvent>[];
}

export const ExtendedEventTable = forwardRef<CurbyTableRef<ExtendedEvent>, ExtendedEventTableProps>(
  function ExtendedEventTable(
    {
      defaultFilters,
      onRowClick,
      rowActionSections,
      toolbarLeft,
      toolbarRight,
      height = 500,
      maxHeight,
      extraColumns = []
    }: ExtendedEventTableProps,
    ref
  ) {
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
  }
);
