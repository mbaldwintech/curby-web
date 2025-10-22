'use client';

import { AdminPageContainer } from '@core/components';
import { PrivacyPolicyTable } from '@features/legal/components';
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
        getRowActionMenuItems={() => [
          {
            label: 'View Details',
            icon: InfoIcon,
            onClick: (policy) => {
              router.push(`/admin/legal/privacy/versions/${policy.id}`);
            }
          }
        ]}
      />
    </AdminPageContainer>
  );
}
