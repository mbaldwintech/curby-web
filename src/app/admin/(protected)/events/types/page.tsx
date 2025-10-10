'use client';

import { buildColumnDef, CurbyTable, CustomColumnDef } from '@core/components';
import { AdminHeader } from '@core/components/admin-header';
import { EventTypeService } from '@core/services';
import { EventType } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';

export default function EventTypesPage() {
  const router = useRouter();
  const service = useRef(createClientService(EventTypeService)).current;

  const buildColumn = useCallback(
    <K extends keyof EventType>(
      key: K,
      header: string,
      options?: Partial<CustomColumnDef<EventType, EventType[K]>>
    ) => {
      return buildColumnDef<EventType, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<EventType>[] = useMemo(
    () => [
      buildColumn('key', 'Event Key', { enableHiding: false }),
      buildColumn('name', 'Name'),
      buildColumn('category', 'Category')
    ],
    [buildColumn]
  );

  return (
    <>
      <AdminHeader title="Event Types" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
        <CurbyTable
          service={service}
          columns={columns}
          height={500}
          onRowClick={(event) => {
            router.push(`/admin/events/types/${event.id}`);
          }}
          rowActionSections={[
            [
              {
                label: 'View Details',
                icon: <InfoIcon size={14} />,
                onClick: (event) => {
                  router.push(`/admin/events/types/${event.id}`);
                }
              }
            ]
          ]}
        />
      </div>
    </>
  );
}
