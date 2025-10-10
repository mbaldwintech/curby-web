'use client';

import { buildColumnDef, CurbyTable, CustomColumnDef } from '@core/components';
import { AdminHeader } from '@core/components/admin-header';
import { PrivacyPolicyCell } from '@core/components/privacy-policy-cell';
import { ProfileCell } from '@core/components/profile-cell';
import { PrivacyPolicyAcceptanceService } from '@core/services';
import { PrivacyPolicyAcceptance } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';

export default function PrivacyPolicyAcceptancesPage() {
  const router = useRouter();
  const service = useRef(createClientService(PrivacyPolicyAcceptanceService)).current;

  const buildColumn = useCallback(
    <K extends keyof PrivacyPolicyAcceptance>(
      key: K,
      header: string,
      options?: Partial<CustomColumnDef<PrivacyPolicyAcceptance, PrivacyPolicyAcceptance[K]>>
    ) => {
      return buildColumnDef<PrivacyPolicyAcceptance, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<PrivacyPolicyAcceptance>[] = useMemo(
    () => [
      buildColumn('userId', 'User', {
        cell: ({ row }) => <ProfileCell userId={row.original.userId} />
      }),
      buildColumn('privacyPolicyId', 'Privacy Policy', {
        cell: ({ row }) => <PrivacyPolicyCell privacyPolicyId={row.original.privacyPolicyId} />
      }),
      buildColumn('acceptedAt', 'Accepted At', {
        cell: ({ row }) => <div>{new Date(row.original.acceptedAt).toLocaleString()}</div>
      })
    ],
    [buildColumn]
  );

  return (
    <>
      <AdminHeader title="Privacy Policy Acceptances" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
        <CurbyTable
          service={service}
          columns={columns}
          height={500}
          onRowClick={(acceptance) => {
            router.push(`/admin/legal/privacy/acceptances/${acceptance.id}`);
          }}
          rowActionSections={[
            [
              {
                label: 'View Details',
                icon: <InfoIcon size={14} />,
                onClick: (acceptance) => {
                  router.push(`/admin/legal/privacy/acceptances/${acceptance.id}`);
                }
              }
            ]
          ]}
        />
      </div>
    </>
  );
}
