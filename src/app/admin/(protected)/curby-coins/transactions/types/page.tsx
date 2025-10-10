'use client';

import { buildColumnDef, Checkbox, CurbyTable, CustomColumnDef } from '@core/components';
import { AdminHeader } from '@core/components/admin-header';
import { EventTypeCell } from '@core/components/event-type-cell';
import { CurbyCoinTransactionTypeService } from '@core/services';
import { CurbyCoinTransactionType } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';

export default function CurbyCoinTransactionTypesPage() {
  const router = useRouter();
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
      })
    ],
    [buildColumn]
  );

  return (
    <>
      <AdminHeader title="Curby Coin Transaction Types" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
        <CurbyTable
          service={service}
          columns={columns}
          height={500}
          onRowClick={(event) => {
            router.push(`/admin/curby-coins/transactions/types/${event.id}`);
          }}
          rowActionSections={[
            [
              {
                label: 'View Details',
                icon: <InfoIcon size={14} />,
                onClick: (event) => {
                  router.push(`/admin/curby-coins/transactions/types/${event.id}`);
                }
              }
            ]
          ]}
        />
      </div>
    </>
  );
}
