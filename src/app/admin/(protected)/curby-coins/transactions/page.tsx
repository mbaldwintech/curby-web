'use client';

import { AdminPageContainer, CurbyCoinTransactionTable } from '@core/components';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CurbyCoinTransactionsPage() {
  const router = useRouter();

  return (
    <AdminPageContainer title="Curby Coin Transactions">
      <CurbyCoinTransactionTable
        onRowClick={(tx) => {
          router.push(`/admin/curby-coins/transactions/${tx.id}`);
        }}
        getRowActionMenuItems={() => [
          {
            label: 'View Details',
            icon: InfoIcon,
            onClick: (tx) => {
              router.push(`/admin/curby-coins/transactions/${tx.id}`);
            }
          }
        ]}
      />
    </AdminPageContainer>
  );
}
