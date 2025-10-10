'use client';

import { buildColumnDef, CurbyTable, CustomColumnDef } from '@core/components';
import { AdminHeader } from '@core/components/admin-header';
import { PrivacyPolicyService } from '@core/services';
import { PrivacyPolicy } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const service = useRef(createClientService(PrivacyPolicyService)).current;

  const buildColumn = useCallback(
    <K extends keyof PrivacyPolicy>(
      key: K,
      header: string,
      options?: Partial<CustomColumnDef<PrivacyPolicy, PrivacyPolicy[K]>>
    ) => {
      return buildColumnDef<PrivacyPolicy, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<PrivacyPolicy>[] = useMemo(
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
      <AdminHeader title="Privacy Policy" />
      <div className="@container/main flex flex-1 flex-col p-4 md:gap-6 md:p-6">
        <CurbyTable
          service={service}
          columns={columns}
          height={500}
          onRowClick={(policy) => {
            router.push(`/admin/legal/privacy/versions/${policy.id}`);
          }}
          rowActionSections={[
            [
              {
                label: 'View Details',
                icon: <InfoIcon size={14} />,
                onClick: (policy) => {
                  router.push(`/admin/legal/privacy/versions/${policy.id}`);
                }
              }
            ]
          ]}
        />
      </div>
    </>
  );
}
