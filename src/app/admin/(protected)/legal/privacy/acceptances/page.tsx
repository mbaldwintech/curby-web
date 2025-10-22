'use client';

import { AdminPageContainer } from '@core/components';
import { PrivacyPolicyAcceptanceTable } from '@features/legal/components';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyAcceptancesPage() {
  const router = useRouter();

  return (
    <AdminPageContainer title="Privacy Policy Acceptances">
      <PrivacyPolicyAcceptanceTable
        onRowClick={(acceptance) => {
          router.push(`/admin/legal/privacy/acceptances/${acceptance.id}`);
        }}
        getRowActionMenuItems={() => [
          {
            label: 'View Details',
            icon: InfoIcon,
            onClick: (acceptance) => {
              router.push(`/admin/legal/privacy/acceptances/${acceptance.id}`);
            }
          }
        ]}
      />
    </AdminPageContainer>
  );
}
