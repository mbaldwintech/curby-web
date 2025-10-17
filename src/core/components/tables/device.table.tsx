'use client';

import { Badge, CustomColumnDef } from '@common/components';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { DeviceService } from '../../services';
import { Device } from '../../types';
import { CopyableStringCell, UserForDeviceCell } from '../cells';
import { buildColumnDef, CurbyTable, CurbyTableProps, CurbyTableRef } from '../curby-table';

export interface DeviceTableProps extends Omit<CurbyTableProps<Device>, 'service' | 'columns'> {
  extraColumns?: CustomColumnDef<Device>[];
}

export const DeviceTable = forwardRef<CurbyTableRef<Device>, DeviceTableProps>(function DeviceTable(
  props: DeviceTableProps,
  ref
) {
  const { extraColumns = [], ...rest } = props;
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
      }),
      ...extraColumns
    ],
    [buildColumn, extraColumns]
  );

  return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
});
