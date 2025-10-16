'use client';

import { Badge, CustomColumnDef } from '@common/components';
import { Filters } from '@supa/services';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { FeedbackService } from '../../services';
import { Feedback } from '../../types';
import { ProfileCell } from '../cells';
import { buildColumnDef, CurbyTable, CurbyTableRef, CurbyTableRowAction } from '../curby-table';

export interface FeedbackTableProps {
  defaultFilters?: Filters<Feedback>;
  onRowClick?: (feedback: Feedback) => void;
  rowActionSections?: CurbyTableRowAction<Feedback>[][];
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  height?: number;
  maxHeight?: number;
  extraColumns?: CustomColumnDef<Feedback>[];
}

export const FeedbackTable = forwardRef<CurbyTableRef<Feedback>, FeedbackTableProps>(function FeedbackTable(
  {
    defaultFilters,
    onRowClick,
    rowActionSections,
    toolbarLeft,
    toolbarRight,
    height = 500,
    maxHeight,
    extraColumns = []
  }: FeedbackTableProps,
  ref
) {
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

  return (
    <CurbyTable
      ref={ref}
      service={service}
      defaultFilters={defaultFilters}
      columns={columns}
      height={height}
      maxHeight={maxHeight}
      onRowClick={onRowClick}
      rowActionSections={rowActionSections}
      toolbarLeft={toolbarLeft}
      toolbarRight={toolbarRight}
    />
  );
});
