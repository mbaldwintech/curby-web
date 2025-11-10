'use client';

import {
  buildColumnDef,
  buildEnumFilterComponentOptions,
  CurbyTable,
  CurbyTableProps,
  CurbyTableRef,
  CustomColumnDef
} from '@core/components';
import { TutorialViewStatus } from '@core/enumerations';
import { TutorialViewService } from '@core/services';
import { TutorialView } from '@core/types';
import { DeviceCell } from '@features/devices/components';
import { TutorialCell, TutorialViewStatusBadge } from '@features/tutorials/components';
import { ProfileCell } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TutorialViewTableProps extends Omit<CurbyTableProps<TutorialView>, 'service' | 'columns'> {}

export const TutorialViewTable = forwardRef<CurbyTableRef<TutorialView>, TutorialViewTableProps>(
  function TutorialViewTable(props: TutorialViewTableProps, ref) {
    const { ...rest } = props;
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
      () =>
        [
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
            cell: ({ row }) => <TutorialViewStatusBadge status={row.original.status} />,
            filterComponentOptions: buildEnumFilterComponentOptions(TutorialViewStatus)
          }),
          buildColumn('updatedAt', 'Updated At', {
            cell: ({ row }) => new Date(row.original.updatedAt).toLocaleString()
          })
        ].filter((c) => c !== undefined),
      [buildColumn]
    );

    return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
  }
);
