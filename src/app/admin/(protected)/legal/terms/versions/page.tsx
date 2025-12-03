'use client';

import { AdminPageContainer } from '@core/components';
import { TermsAndConditionsTable } from '@features/legal/components';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsAndConditionsPage() {
  const router = useRouter();

  return (
    <AdminPageContainer title="Terms & Conditions">
      <TermsAndConditionsTable
        onRowClick={(terms) => {
          router.push(`/admin/legal/terms/versions/${terms.id}`);
        }}
        getRowActionMenuItems={() => [
          {
            label: 'View details',
            icon: InfoIcon,
            onClick: (terms) => {
              router.push(`/admin/legal/terms/versions/${terms.id}`);
            }
          }
        ]}
      />
    </AdminPageContainer>
  );
}
