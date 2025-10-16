'use client';

import { AdminPageContainer, PrivacyPolicyTable } from '@core/components';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <AdminPageContainer title="Privacy Policy">
      <PrivacyPolicyTable
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
    </AdminPageContainer>
  );
}
