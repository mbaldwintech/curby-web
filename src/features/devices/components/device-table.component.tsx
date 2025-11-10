'use client';

import {
  Badge,
  buildColumnDef,
  CopyableStringCell,
  CurbyTable,
  CurbyTableProps,
  CurbyTableRef,
  CustomColumnDef
} from '@core/components';
import { DeviceService } from '@core/services';
import { Device } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { UserForDeviceCell } from './user-for-device-cell.component';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DeviceTableProps extends Omit<CurbyTableProps<Device>, 'service' | 'columns'> {}

export const DeviceTable = forwardRef<CurbyTableRef<Device>, DeviceTableProps>(function DeviceTable(
  props: DeviceTableProps,
  ref
) {
  const { ...rest } = props;
  const service = useRef(createClientService(DeviceService)).current;

  const buildColumn = useCallback(
    <K extends keyof Device>(key: K, header: string, options?: Partial<CustomColumnDef<Device, Device[K]>>) => {
      return buildColumnDef<Device, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<Device>[] = useMemo(
    () =>
      (
        [
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
            cell: ({ row }) => row.original.type && <Badge variant="outline">{row.original.type}</Badge>
          }),
          buildColumn('deviceName', 'Device Name'),
          buildColumn('platform', 'Platform', {
            cell: ({ row }) => row.original.platform && <Badge variant="outline">{row.original.platform}</Badge>
          }),
          buildColumn('appVersion', 'App Version', {
            cell: ({ row }) => row.original.appVersion && <Badge variant="outline">{row.original.appVersion}</Badge>
          }),
          buildColumn('osVersion', 'OS Version', {
            cell: ({ row }) => row.original.osVersion && <Badge variant="outline">{row.original.osVersion}</Badge>
          })
        ] as (CustomColumnDef<Device> | undefined)[]
      ).filter((c) => c !== undefined),
    [buildColumn]
  );

  return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
});
