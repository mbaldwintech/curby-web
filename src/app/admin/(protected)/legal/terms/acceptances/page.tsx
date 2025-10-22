'use client';

import { AdminPageContainer } from '@core/components';
import { TermsAndConditionsAcceptanceTable } from '@features/legal/components';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsAndConditionsAcceptancesPage() {
  const router = useRouter();

  return (
    <AdminPageContainer title="Terms & Conditions Acceptances">
      <TermsAndConditionsAcceptanceTable
        onRowClick={(acceptance) => {
          router.push(`/admin/legal/terms/acceptances/${acceptance.id}`);
        }}
        getRowActionMenuItems={() => [
          {
            label: 'View Details',
            icon: InfoIcon,
            onClick: (acceptance) => {
              router.push(`/admin/legal/terms/acceptances/${acceptance.id}`);
            }
          }
        ]}
      />
    </AdminPageContainer>
  );
}
