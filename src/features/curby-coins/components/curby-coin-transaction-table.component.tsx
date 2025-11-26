'use client';

import { buildColumnDef, CurbyTable, CurbyTableProps, CurbyTableRef, CustomColumnDef } from '@core/components';
import { CurbyCoinTransactionService } from '@core/services';
import { CurbyCoinTransaction } from '@core/types';
import { EventCell } from '@features/events/components';
import { ProfileCell } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { CurbyCoinTransactionTypeCell } from './curby-coin-transaction-type-cell.component';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CurbyCoinTransactionTableProps
  extends Omit<CurbyTableProps<CurbyCoinTransaction>, 'service' | 'columns'> {}

export const CurbyCoinTransactionTable = forwardRef<
  CurbyTableRef<CurbyCoinTransaction>,
  CurbyCoinTransactionTableProps
>(function CurbyCoinTransactionTable(props: CurbyCoinTransactionTableProps, ref) {
  const { ...rest } = props;
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
    () =>
      [
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
        buildColumn('balanceAfter', 'Balance After')
      ].filter((c) => c !== undefined),
    [buildColumn]
  );

  return <CurbyTable ref={ref} columns={columns} service={service} {...rest} />;
});
