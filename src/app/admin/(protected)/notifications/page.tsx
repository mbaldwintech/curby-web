'use client';

import { buildColumnDef, CurbyTable, CustomColumnDef } from '@core/components';
import { AdminHeader } from '@core/components/admin-header';
import { CurbyCoinTransactionCell } from '@core/components/curby-coin-transaction-cell';
import { DeviceCell } from '@core/components/device-cell';
import { EventCell } from '@core/components/event-cell';
import { NotificationTemplateCell } from '@core/components/notification-template-cell';
import { ProfileCell } from '@core/components/profile-cell';
import { NotificationService } from '@core/services';
import { Notification } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';

export default function NotificationsPage() {
  const router = useRouter();
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
      buildColumn('deliveryChannel', 'Delivery Channel')
    ],
    [buildColumn]
  );

  return (
    <>
      <AdminHeader title="Notifications" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
        <CurbyTable
          service={service}
          columns={columns}
          height={500}
          onRowClick={(template) => {
            router.push(`/admin/notifications/${template.id}`);
          }}
          rowActionSections={[
            [
              {
                label: 'View Details',
                icon: <InfoIcon size={14} />,
                onClick: (template) => {
                  router.push(`/admin/notifications/${template.id}`);
                }
              }
            ]
          ]}
        />
      </div>
    </>
  );
}
