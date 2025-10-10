'use client';

import { Badge, buildColumnDef, CurbyTable, CustomColumnDef } from '@core/components';
import { AdminHeader } from '@core/components/admin-header';
import { DeviceCell } from '@core/components/device-cell';
import { ProfileCell } from '@core/components/profile-cell';
import { TutorialCell } from '@core/components/tutorial-cell';
import { TutorialViewService } from '@core/services';
import { TutorialView } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';

export default function TutorialViewsPage() {
  const router = useRouter();
  const service = useRef(createClientService(TutorialViewService)).current;

  const buildColumn = useCallback(
    <K extends keyof TutorialView>(
      key: K,
      header: string,
      options?: Partial<CustomColumnDef<TutorialView, TutorialView[K]>>
    ) => {
      return buildColumnDef<TutorialView, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<TutorialView>[] = useMemo(
    () => [
      buildColumn('tutorialId', 'Tutorial', {
        enableHiding: false,
        cell: ({ row }) => <TutorialCell tutorialId={row.original.tutorialId} />
      }),
      buildColumn('userId', 'User', {
        cell: ({ row }) => <ProfileCell userId={row.original.userId} />
      }),
      buildColumn('deviceId', 'Device', {
        cell: ({ row }) => <DeviceCell deviceId={row.original.deviceId} />
      }),
      buildColumn('status', 'Status', {
        cell: ({ row }) =>
          row.original.status && (
            <div className="w-32">
              <Badge variant="outline" className="text-muted-foreground px-1.5">
                {row.original.status}
              </Badge>
            </div>
          )
      })
    ],
    [buildColumn]
  );

  return (
    <>
      <AdminHeader title="Tutorial Views" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
        <CurbyTable
          service={service}
          columns={columns}
          height={500}
          onRowClick={(view) => {
            router.push(`/admin/tutorials/views/${view.id}`);
          }}
          rowActionSections={[
            [
              {
                label: 'View Details',
                icon: <InfoIcon size={14} />,
                onClick: (view) => {
                  router.push(`/admin/tutorials/views/${view.id}`);
                }
              }
            ]
          ]}
        />
      </div>
    </>
  );
}
