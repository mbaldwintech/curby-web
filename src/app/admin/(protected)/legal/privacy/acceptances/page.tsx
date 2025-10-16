'use client';

import { AdminPageContainer, PrivacyPolicyAcceptanceTable } from '@core/components';
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
    </AdminPageContainer>
  );
}
