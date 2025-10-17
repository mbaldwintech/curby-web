'use client';

import { AdminPageContainer, TermsAndConditionsTable } from '@core/components';
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
            label: 'View Details',
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
