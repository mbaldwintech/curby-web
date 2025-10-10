'use client';

import { buildColumnDef, CurbyTable, CustomColumnDef } from '@core/components';
import { AdminHeader } from '@core/components/admin-header';
import { DeviceCell } from '@core/components/device-cell';
import { ProfileCell } from '@core/components/profile-cell';
import { ExtendedEventService } from '@core/services';
import { ExtendedEvent } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';

export default function EventLogsPage() {
  const router = useRouter();
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
      })
    ],
    [buildColumn]
  );

  return (
    <>
      <AdminHeader title="Event Logs" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
        <CurbyTable
          service={service}
          columns={columns}
          height={500}
          onRowClick={(event) => {
            router.push(`/admin/events/logs/${event.id}`);
          }}
          rowActionSections={[
            [
              {
                label: 'View Details',
                icon: <InfoIcon size={14} />,
                onClick: (event) => {
                  router.push(`/admin/events/logs/${event.id}`);
                }
              }
            ]
          ]}
        />
      </div>
    </>
  );
}
