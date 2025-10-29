'use client';

import { Badge, buildColumnDef, CurbyTable, CurbyTableProps, CurbyTableRef, CustomColumnDef } from '@core/components';
import { FeedbackService } from '@core/services';
import { Feedback } from '@core/types';
import { ProfileCell } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';

export interface FeedbackTableProps extends Omit<CurbyTableProps<Feedback>, 'service' | 'columns'> {
  extraColumns?: CustomColumnDef<Feedback>[];
}

export const FeedbackTable = forwardRef<CurbyTableRef<Feedback>, FeedbackTableProps>(function FeedbackTable(
  props: FeedbackTableProps,
  ref
) {
  const { extraColumns = [], ...rest } = props;
  const service = useRef(createClientService(FeedbackService)).current;

  const buildColumn = useCallback(
    <K extends keyof Feedback>(key: K, header: string, options?: Partial<CustomColumnDef<Feedback, Feedback[K]>>) => {
      return buildColumnDef<Feedback, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<Feedback>[] = useMemo(
    () => [
      buildColumn('userId', 'User', { cell: ({ row }) => <ProfileCell userId={row.original.userId} /> }),
      buildColumn('type', 'Type', {
        cell: ({ row }) =>
          row.original.type === 'general' ? (
            <Badge className="bg-blue-100 text-blue-600 px-1.5">General</Badge>
          ) : row.original.type === 'bug' ? (
            <Badge className="bg-red-100 text-red-600 px-1.5">Bug Report</Badge>
          ) : row.original.type === 'feature' ? (
            <Badge className="bg-green-100 text-green-600 px-1.5">Feature Request</Badge>
          ) : row.original.type === 'question' ? (
            <Badge className="bg-yellow-100 text-yellow-600 px-1.5">Question</Badge>
          ) : (
            row.original.type || '-'
          )
      }),
      buildColumn('message', 'Message', { cell: ({ row }) => <div className="max-w-lg">{row.original.message}</div> }),
      buildColumn('resolved', 'Resolved'),
      ...extraColumns
    ],
    [buildColumn, extraColumns]
  );

  return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
});
