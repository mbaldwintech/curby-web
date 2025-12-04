'use client';

import { buildColumnDef, CurbyTable, CurbyTableProps, CurbyTableRef, CustomColumnDef } from '@core/components';
import { NotificationTemplateService } from '@core/services';
import { NotificationTemplate } from '@core/types';
import { EventTypeCell } from '@features/events/components';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { CurbyCoinTransactionTypeCell } from '../../curby-coins/components';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NotificationTemplateTableProps
  extends Omit<CurbyTableProps<NotificationTemplate>, 'service' | 'columns'> {}

export const NotificationTemplateTable = forwardRef<
  CurbyTableRef<NotificationTemplate>,
  NotificationTemplateTableProps
>(function NotificationTemplateTable(props: NotificationTemplateTableProps, ref) {
  const { ...rest } = props;
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
    () =>
      [
        buildColumn('key', 'Key', { enableHiding: false }),
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
        buildColumn('validTo', 'Valid To', {
          cell: ({ row }) => new Date(row.original.validFrom).toLocaleDateString()
        }),
        buildColumn('active', 'Active', { cell: ({ row }) => (row.original.active ? 'Yes' : 'No') })
      ].filter((c) => c !== undefined),
    [buildColumn]
  );

  return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
});
