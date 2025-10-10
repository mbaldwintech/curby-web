'use client';

import { buildColumnDef, CurbyTable, CustomColumnDef } from '@core/components';
import { AdminHeader } from '@core/components/admin-header';
import { Badge } from '@core/components/badge';
import { CopyableStringCell } from '@core/components/copyable-string-cell';
import { UserForDeviceCell } from '@core/components/user-for-device-cell';
import { DeviceService } from '@core/services';
import { Device } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';

export default function DevicesPage() {
  const router = useRouter();
  const service = useRef(createClientService(DeviceService)).current;

  const buildColumn = useCallback(
    <K extends keyof Device>(key: K, header: string, options?: Partial<CustomColumnDef<Device, Device[K]>>) => {
      return buildColumnDef<Device, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<Device>[] = useMemo(
    () => [
      buildColumn('deviceId', 'Device ID', {
        cell: ({ row }) => <CopyableStringCell value={row.original.deviceId} className="w-32" />
      }),
      {
        accessorKey: 'userId',
        header: 'User',
        cell: ({ row }) => {
          return <UserForDeviceCell deviceId={row.original.id} />;
        },
        enableColumnFilter: false,
        enableSearching: false,
        enableSorting: false
      },
      buildColumn('label', 'Label'),
      buildColumn('type', 'Type', {
        cell: ({ row }) =>
          row.original.type && (
            <div className="w-32">
              <Badge variant="outline" className="text-muted-foreground px-1.5">
                {row.original.type}
              </Badge>
            </div>
          )
      }),
      buildColumn('deviceName', 'Device Name'),
      buildColumn('platform', 'Platform', {
        cell: ({ row }) =>
          row.original.platform && (
            <div className="w-32">
              <Badge variant="outline" className="text-muted-foreground px-1.5">
                {row.original.platform}
              </Badge>
            </div>
          )
      }),
      buildColumn('appVersion', 'App Version', {
        cell: ({ row }) =>
          row.original.appVersion && (
            <div className="w-32">
              <Badge variant="outline" className="text-muted-foreground px-1.5">
                {row.original.appVersion}
              </Badge>
            </div>
          )
      }),
      buildColumn('osVersion', 'OS Version', {
        cell: ({ row }) =>
          row.original.osVersion && (
            <div className="w-32">
              <Badge variant="outline" className="text-muted-foreground px-1.5">
                {row.original.osVersion}
              </Badge>
            </div>
          )
      })
    ],
    [buildColumn]
  );

  return (
    <>
      <AdminHeader title="Devices" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
        <CurbyTable
          service={service}
          columns={columns}
          height={500}
          onRowClick={(device) => {
            router.push(`/admin/devices/${device.id}`);
          }}
          rowActionSections={[
            [
              {
                label: 'View Details',
                icon: <InfoIcon size={14} />,
                onClick: (device) => {
                  router.push(`/admin/devices/${device.id}`);
                }
              }
            ]
          ]}
        />
      </div>
    </>
  );
}
