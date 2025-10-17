'use client';

import { AdminPageContainer, CurbyCoinTransactionTypeTable } from '@core/components';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CurbyCoinTransactionTypesPage() {
  const router = useRouter();

  return (
    <AdminPageContainer title="Curby Coin Transaction Types">
      <CurbyCoinTransactionTypeTable
        onRowClick={(event) => {
          router.push(`/admin/curby-coins/transactions/types/${event.id}`);
        }}
        getRowActionMenuItems={() => [
          {
            label: 'View Details',
            icon: InfoIcon,
            onClick: (event) => {
              router.push(`/admin/curby-coins/transactions/types/${event.id}`);
            }
          }
        ]}
      />
    </AdminPageContainer>
  );
}
