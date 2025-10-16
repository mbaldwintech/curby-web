'use client';

import { Checkbox, CustomColumnDef } from '@common/components';
import { Filters } from '@supa/services';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { CurbyCoinTransactionTypeService } from '../../services';
import { CurbyCoinTransactionType } from '../../types';
import { EventTypeCell } from '../cells';
import { buildColumnDef, CurbyTable, CurbyTableRef, CurbyTableRowAction } from '../curby-table';

export interface CurbyCoinTransactionTypeTableProps {
  defaultFilters?: Filters<CurbyCoinTransactionType>;
  onRowClick?: (curbyCoinTransactionType: CurbyCoinTransactionType) => void;
  rowActionSections?: CurbyTableRowAction<CurbyCoinTransactionType>[][];
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  height?: number;
  maxHeight?: number;
  extraColumns?: CustomColumnDef<CurbyCoinTransactionType>[];
}

export const CurbyCoinTransactionTypeTable = forwardRef<
  CurbyTableRef<CurbyCoinTransactionType>,
  CurbyCoinTransactionTypeTableProps
>(function CurbyCoinTransactionTypeTable(
  {
    defaultFilters,
    onRowClick,
    rowActionSections,
    toolbarLeft,
    toolbarRight,
    height = 500,
    maxHeight,
    extraColumns = []
  }: CurbyCoinTransactionTypeTableProps,
  ref
) {
  const service = useRef(createClientService(CurbyCoinTransactionTypeService)).current;

  const buildColumn = useCallback(
    <K extends keyof CurbyCoinTransactionType>(
      key: K,
      header: string,
      options?: Partial<CustomColumnDef<CurbyCoinTransactionType, CurbyCoinTransactionType[K]>>
    ) => {
      return buildColumnDef<CurbyCoinTransactionType, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<CurbyCoinTransactionType>[] = useMemo(
    () => [
      buildColumn('sortOrder', 'Sort Order', {
        enableHiding: false
      }),
      buildColumn('key', 'Key', { enableHiding: false }),
      buildColumn('eventTypeId', 'Event Type', {
        cell: ({ row }) => <EventTypeCell eventTypeId={row.original.eventTypeId} />
      }),
      buildColumn('category', 'Category'),
      buildColumn('displayName', 'Display Name'),
      buildColumn('recipient', 'Recipient'),
      buildColumn('amount', 'Amount'),
      buildColumn('validFrom', 'Valid From', {
        cell: ({ row }) => new Date(row.original.validFrom).toLocaleDateString()
      }),
      buildColumn('validTo', 'Valid To', {
        cell: ({ row }) => (row.original.validTo ? new Date(row.original.validTo).toLocaleDateString() : '')
      }),
      buildColumn('max', 'Max'),
      buildColumn('maxPerDay', 'Max Per Day'),
      buildColumn('active', 'Active', {
        cell: ({ row }) => <Checkbox checked={row.original.active} disabled />
      }),
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
