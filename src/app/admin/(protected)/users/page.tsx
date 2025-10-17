'use client';

import { AdminPageContainer, ProfileTable } from '@core/components';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const router = useRouter();

  return (
    <AdminPageContainer title="Users">
      <ProfileTable
        onRowClick={(row) => {
          router.push(`/admin/users/${row.original.userId}`);
        }}
        getRowActionMenuItems={() => [
          {
            label: 'View Details',
            icon: InfoIcon,
            onClick: (row) => {
              router.push(`/admin/users/${row.original.userId}`);
            }
          }
        ]}
      />
    </AdminPageContainer>
  );
}
