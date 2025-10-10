'use client';

import { buildColumnDef, CurbyTable, CustomColumnDef } from '@core/components';
import { AdminHeader } from '@core/components/admin-header';
import { CurbyCoinTransactionTypeCell } from '@core/components/curby-coin-transaction-type-cell';
import { EventTypeCell } from '@core/components/event-type-cell';
import { NotificationTemplateService } from '@core/services';
import { NotificationTemplate } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';

export default function NotificationTemplatesPage() {
  const router = useRouter();
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
      buildColumn('active', 'Active', { cell: ({ row }) => (row.original.active ? 'Yes' : 'No') })
    ],
    [buildColumn]
  );

  return (
    <>
      <AdminHeader title="Notification Templates" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
        <CurbyTable
          service={service}
          columns={columns}
          height={500}
          onRowClick={(template) => {
            router.push(`/admin/notifications/templates/${template.id}`);
          }}
          rowActionSections={[
            [
              {
                label: 'View Details',
                icon: <InfoIcon size={14} />,
                onClick: (template) => {
                  router.push(`/admin/notifications/templates/${template.id}`);
                }
              }
            ]
          ]}
        />
      </div>
    </>
  );
}
