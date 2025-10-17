'use client';

import { CustomColumnDef } from '@common/components';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { NotificationTemplateService } from '../../services';
import { NotificationTemplate } from '../../types';
import { CurbyCoinTransactionTypeCell, EventTypeCell } from '../cells';
import { buildColumnDef, CurbyTable, CurbyTableProps, CurbyTableRef } from '../curby-table';

export interface NotificationTemplateTableProps
  extends Omit<CurbyTableProps<NotificationTemplate>, 'service' | 'columns'> {
  extraColumns?: CustomColumnDef<NotificationTemplate>[];
}

export const NotificationTemplateTable = forwardRef<
  CurbyTableRef<NotificationTemplate>,
  NotificationTemplateTableProps
>(function NotificationTemplateTable(props: NotificationTemplateTableProps, ref) {
  const { extraColumns = [], ...rest } = props;
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

  return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
});
