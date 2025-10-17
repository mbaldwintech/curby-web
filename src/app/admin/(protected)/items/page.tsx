'use client';

import { AdminPageContainer, ItemTable } from '@core/components';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ItemsPage() {
  const router = useRouter();

  return (
    <AdminPageContainer title="Items">
      <ItemTable
        onRowClick={(item) => {
          router.push(`/admin/items/${item.id}`);
        }}
        getRowActionMenuItems={() => [
          {
            label: 'View Details',
            icon: InfoIcon,
            onClick: (item) => {
              router.push(`/admin/items/${item.id}`);
            }
          }
        ]}
      />
    </AdminPageContainer>
  );
}
