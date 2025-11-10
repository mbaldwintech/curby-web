'use client';

import {
  buildColumnDef,
  buildEnumFilterComponentOptions,
  CurbyTable,
  CurbyTableProps,
  CurbyTableRef,
  CustomColumnDef
} from '@core/components';
import { FeedbackType } from '@core/enumerations';
import { FeedbackService } from '@core/services';
import { Feedback } from '@core/types';
import { ProfileCell } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { FeedbackTypeBadge } from './feedback-type-badge.component';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FeedbackTableProps extends Omit<CurbyTableProps<Feedback>, 'service' | 'columns'> {}

export const FeedbackTable = forwardRef<CurbyTableRef<Feedback>, FeedbackTableProps>(function FeedbackTable(
  props: FeedbackTableProps,
  ref
) {
  const { ...rest } = props;
  const service = useRef(createClientService(FeedbackService)).current;

  const buildColumn = useCallback(
    <K extends keyof Feedback>(key: K, header: string, options?: Partial<CustomColumnDef<Feedback, Feedback[K]>>) => {
      return buildColumnDef<Feedback, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<Feedback>[] = useMemo(
    () =>
      [
        buildColumn('userId', 'User', { cell: ({ row }) => <ProfileCell userId={row.original.userId} /> }),
        buildColumn('type', 'Type', {
          cell: ({ row }) => <FeedbackTypeBadge type={row.original.type} />,
          filterComponentOptions: buildEnumFilterComponentOptions(FeedbackType)
        }),
        buildColumn('message', 'Message', {
          cell: ({ row }) => <div className="max-w-lg">{row.original.message}</div>
        }),
        buildColumn('resolved', 'Resolved')
      ].filter((c) => c !== undefined),
    [buildColumn]
  );

  return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
});
