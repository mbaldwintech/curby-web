'use client';

import {
  buildColumnDef,
  Checkbox,
  CurbyTable,
  CurbyTableProps,
  CurbyTableRef,
  CustomColumnDef
} from '@core/components';
import { CurbyCoinTransactionTypeService } from '@core/services';
import { CurbyCoinTransactionType } from '@core/types';
import { EventTypeCell } from '@features/events/components';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';

export interface CurbyCoinTransactionTypeTableProps
  extends Omit<CurbyTableProps<CurbyCoinTransactionType>, 'service' | 'columns'> {
  extraColumns?: CustomColumnDef<CurbyCoinTransactionType>[];
}

export const CurbyCoinTransactionTypeTable = forwardRef<
  CurbyTableRef<CurbyCoinTransactionType>,
  CurbyCoinTransactionTypeTableProps
>(function CurbyCoinTransactionTypeTable(props: CurbyCoinTransactionTypeTableProps, ref) {
  const { extraColumns = [], ...rest } = props;
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

  return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
});
