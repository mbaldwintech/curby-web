'use client';

import { buildColumnDef, CurbyTable, CustomColumnDef } from '@core/components';
import { AdminHeader } from '@core/components/admin-header';
import { ProfileCell } from '@core/components/profile-cell';
import { TermsAndConditionsCell } from '@core/components/terms-and-conditions-cell';
import { TermsAndConditionsAcceptanceService } from '@core/services';
import { TermsAndConditionsAcceptance } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';

export default function TermsAndConditionsAcceptancesPage() {
  const router = useRouter();
  const service = useRef(createClientService(TermsAndConditionsAcceptanceService)).current;

  const buildColumn = useCallback(
    <K extends keyof TermsAndConditionsAcceptance>(
      key: K,
      header: string,
      options?: Partial<CustomColumnDef<TermsAndConditionsAcceptance, TermsAndConditionsAcceptance[K]>>
    ) => {
      return buildColumnDef<TermsAndConditionsAcceptance, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<TermsAndConditionsAcceptance>[] = useMemo(
    () => [
      buildColumn('userId', 'User', {
        cell: ({ row }) => <ProfileCell userId={row.original.userId} />
      }),
      buildColumn('termsAndConditionsId', 'Terms & Conditions', {
        cell: ({ row }) => <TermsAndConditionsCell termsAndConditionsId={row.original.termsAndConditionsId} />
      }),
      buildColumn('acceptedAt', 'Accepted At', {
        cell: ({ row }) => <div>{new Date(row.original.acceptedAt).toLocaleString()}</div>
      })
    ],
    [buildColumn]
  );

  return (
    <>
      <AdminHeader title="Terms & Conditions Acceptances" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
        <CurbyTable
          service={service}
          columns={columns}
          height={500}
          onRowClick={(acceptance) => {
            router.push(`/admin/legal/terms/acceptances/${acceptance.id}`);
          }}
          rowActionSections={[
            [
              {
                label: 'View Details',
                icon: <InfoIcon size={14} />,
                onClick: (acceptance) => {
                  router.push(`/admin/legal/terms/acceptances/${acceptance.id}`);
                }
              }
            ]
          ]}
        />
      </div>
    </>
  );
}
