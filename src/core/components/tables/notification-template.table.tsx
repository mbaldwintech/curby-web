'use client';

import { CustomColumnDef } from '@common/components';
import { Filters } from '@supa/services';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { NotificationTemplateService } from '../../services';
import { NotificationTemplate } from '../../types';
import { CurbyCoinTransactionTypeCell, EventTypeCell } from '../cells';
import { buildColumnDef, CurbyTable, CurbyTableRef, CurbyTableRowAction } from '../curby-table';

export interface NotificationTemplateTableProps {
  defaultFilters?: Filters<NotificationTemplate>;
  onRowClick?: (notificationTemplate: NotificationTemplate) => void;
  rowActionSections?: CurbyTableRowAction<NotificationTemplate>[][];
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  height?: number;
  maxHeight?: number;
  extraColumns?: CustomColumnDef<NotificationTemplate>[];
}

export const NotificationTemplateTable = forwardRef<
  CurbyTableRef<NotificationTemplate>,
  NotificationTemplateTableProps
>(function NotificationTemplateTable(
  {
    defaultFilters,
    onRowClick,
    rowActionSections,
    toolbarLeft,
    toolbarRight,
    height = 500,
    maxHeight,
    extraColumns = []
  }: NotificationTemplateTableProps,
  ref
) {
  const service = useRef(createClientService(NotificationTemplateService)).current;

  const buildColumn = useCallback(
    <K extends keyof NotificationTemplate>(
      key: K,
      header: string,
      options?: Partial<CustomColumnDef<NotificationTemplate, NotificationTemplate[K]>>
    ) => {
      return buildColumnDef<NotificationTemplate, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<NotificationTemplate>[] = useMemo(
    () => [
      buildColumn('key', 'Event Key', { enableHiding: false }),
      buildColumn('version', 'Version'),
      buildColumn('category', 'Category'),
      buildColumn('eventTypeId', 'Event Trigger', {
        cell: ({ row }) => <EventTypeCell eventTypeId={row.original.eventTypeId} />
      }),
      buildColumn('curbyCoinTransactionTypeId', 'Transaction Trigger', {
        cell: ({ row }) => (
          <CurbyCoinTransactionTypeCell curbyCoinTransactionTypeId={row.original.curbyCoinTransactionTypeId} />
        )
      }),
      buildColumn('recipient', 'Recipient'),
      buildColumn('deliveryChannel', 'Delivery Channel'),
      buildColumn('max', 'Max'),
      buildColumn('maxPerDay', 'Max Per Day'),
      buildColumn('validFrom', 'Valid From', {
        cell: ({ row }) => new Date(row.original.validFrom).toLocaleDateString()
      }),
      buildColumn('validTo', 'Valid To', { cell: ({ row }) => new Date(row.original.validFrom).toLocaleDateString() }),
      buildColumn('active', 'Active', { cell: ({ row }) => (row.original.active ? 'Yes' : 'No') }),
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
