'use client';

import { buildColumnDef, CurbyTable, CustomColumnDef } from '@core/components';
import { AdminHeader } from '@core/components/admin-header';
import { CurbyCoinTransactionTypeCell } from '@core/components/curby-coin-transaction-type-cell';
import { EventCell } from '@core/components/event-cell';
import { ProfileCell } from '@core/components/profile-cell';
import { CurbyCoinTransactionService } from '@core/services';
import { CurbyCoinTransaction } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';

export default function CurbyCoinTransactionsPage() {
  const router = useRouter();
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
      buildColumn('balanceAfter', 'Balance After')
    ],
    [buildColumn]
  );

  return (
    <>
      <AdminHeader title="Curby Coin Transactions" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
        <CurbyTable
          service={service}
          columns={columns}
          height={500}
          onRowClick={(tx) => {
            router.push(`/admin/curby-coins/transactions/${tx.id}`);
          }}
          rowActionSections={[
            [
              {
                label: 'View Details',
                icon: <InfoIcon size={14} />,
                onClick: (tx) => {
                  router.push(`/admin/curby-coins/transactions/${tx.id}`);
                }
              }
            ]
          ]}
        />
      </div>
    </>
  );
}
