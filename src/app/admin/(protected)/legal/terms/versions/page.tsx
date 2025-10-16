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
        rowActionSections={[
          [
            {
              label: 'View Details',
              icon: <InfoIcon size={14} />,
              onClick: (terms) => {
                router.push(`/admin/legal/terms/versions/${terms.id}`);
              }
            }
          ]
        ]}
      />
    </AdminPageContainer>
  );
}
