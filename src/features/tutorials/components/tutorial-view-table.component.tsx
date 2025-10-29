'use client';

import { Badge, buildColumnDef, CurbyTable, CurbyTableProps, CurbyTableRef, CustomColumnDef } from '@core/components';
import { TutorialViewService } from '@core/services';
import { TutorialView } from '@core/types';
import { DeviceCell } from '@features/devices/components';
import { TutorialCell } from '@features/tutorials/components';
import { ProfileCell } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';

export interface TutorialViewTableProps extends Omit<CurbyTableProps<TutorialView>, 'service' | 'columns'> {
  extraColumns?: CustomColumnDef<TutorialView>[];
}

export const TutorialViewTable = forwardRef<CurbyTableRef<TutorialView>, TutorialViewTableProps>(
  function TutorialViewTable(props: TutorialViewTableProps, ref) {
    const { extraColumns = [], ...rest } = props;
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
            row.original.status === 'viewed' ? (
              <Badge className="text-green-600 bg-green-100 px-1.5">Viewed</Badge>
            ) : row.original.status === 'skipped' ? (
              <Badge className="text-yellow-600 bg-yellow-100 px-1.5">Skipped</Badge>
            ) : row.original.status === 'not-started' ? (
              <Badge className="text-muted-foreground bg-muted/20 px-1.5">Not Started</Badge>
            ) : row.original.status === 'completed' ? (
              <Badge className="text-blue-600 bg-blue-100 px-1.5">Completed</Badge>
            ) : (
              row.original.status === 'completed'
            )
        }),
        buildColumn('updatedAt', 'Updated At', {
          cell: ({ row }) => new Date(row.original.updatedAt).toLocaleString()
        }),
        ...extraColumns
      ],
      [buildColumn, extraColumns]
    );

    return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
  }
);
