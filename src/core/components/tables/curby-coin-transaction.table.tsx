'use client';

import { CustomColumnDef } from '@common/components';
import { Filters } from '@supa/services';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { CurbyCoinTransactionService } from '../../services';
import { CurbyCoinTransaction } from '../../types';
import { CurbyCoinTransactionTypeCell, EventCell, ProfileCell } from '../cells';
import { buildColumnDef, CurbyTable, CurbyTableRef, CurbyTableRowAction } from '../curby-table';

export interface CurbyCoinTransactionTableProps {
  defaultFilters?: Filters<CurbyCoinTransaction>;
  onRowClick?: (curbyCoinTransaction: CurbyCoinTransaction) => void;
  rowActionSections?: CurbyTableRowAction<CurbyCoinTransaction>[][];
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  height?: number;
  maxHeight?: number;
  extraColumns?: CustomColumnDef<CurbyCoinTransaction>[];
}

export const CurbyCoinTransactionTable = forwardRef<
  CurbyTableRef<CurbyCoinTransaction>,
  CurbyCoinTransactionTableProps
>(function CurbyCoinTransactionTable(
  {
    defaultFilters,
    onRowClick,
    rowActionSections,
    toolbarLeft,
    toolbarRight,
    height = 500,
    maxHeight,
    extraColumns = []
  }: CurbyCoinTransactionTableProps,
  ref
) {
  const service = useRef(createClientService(CurbyCoinTransactionService)).current;

  const buildColumn = useCallback(
    <K extends keyof CurbyCoinTransaction>(
      key: K,
      header: string,
      options?: Partial<CustomColumnDef<CurbyCoinTransaction, CurbyCoinTransaction[K]>>
    ) => {
      return buildColumnDef<CurbyCoinTransaction, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<CurbyCoinTransaction>[] = useMemo(
    () => [
      buildColumn('occurredAt', 'Occurred At', {
        cell: ({ row }) => new Date(row.original.occurredAt).toLocaleString()
      }),
      buildColumn('eventId', 'Event', {
        cell: ({ row }) => {
          return <EventCell eventId={row.original.eventId} />;
        }
      }),
      buildColumn('curbyCoinTransactionTypeId', 'Transaction Type', {
        cell: ({ row }) => (
          <CurbyCoinTransactionTypeCell curbyCoinTransactionTypeId={row.original.curbyCoinTransactionTypeId} />
        )
      }),
      buildColumn('userId', 'User', {
        cell: ({ row }) => {
          return <ProfileCell userId={row.original.userId} />;
        }
      }),
      buildColumn('amount', 'Amount'),
      buildColumn('balanceAfter', 'Balance After'),
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
