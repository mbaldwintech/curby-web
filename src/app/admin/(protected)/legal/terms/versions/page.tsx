'use client';

import { buildColumnDef, CurbyTable, CustomColumnDef } from '@core/components';
import { AdminHeader } from '@core/components/admin-header';
import { TermsAndConditionsService } from '@core/services';
import { TermsAndConditions } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';

export default function TermsAndConditionsPage() {
  const router = useRouter();
  const service = useRef(createClientService(TermsAndConditionsService)).current;

  const buildColumn = useCallback(
    <K extends keyof TermsAndConditions>(
      key: K,
      header: string,
      options?: Partial<CustomColumnDef<TermsAndConditions, TermsAndConditions[K]>>
    ) => {
      return buildColumnDef<TermsAndConditions, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<TermsAndConditions>[] = useMemo(
    () => [
      buildColumn('version', 'Version'),
      buildColumn('effectiveDate', 'Effective Date', {
        cell: ({ row }) => <div>{new Date(row.original.effectiveDate).toLocaleDateString()}</div>
      })
    ],
    [buildColumn]
  );

  return (
    <>
      <AdminHeader title="Terms & Conditions" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
        <CurbyTable
          service={service}
          columns={columns}
          height={500}
          onRowClick={(terms) => {
            router.push(`/admin/legal/terms/versions/${terms.id}`);
          }}
          rowActionSections={[
            [
              {
                label: 'View Details',
                icon: <InfoIcon size={14} />,
                onClick: (terms) => {
                  router.push(`/admin/legal/terms/versions/${terms.id}`);
                }
              }
            ]
          ]}
        />
      </div>
    </>
  );
}
