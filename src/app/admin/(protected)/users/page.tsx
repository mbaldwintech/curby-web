'use client';

import { AdminPageContainer, ProfileTable } from '@core/components';
import { Profile } from '@core/types';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const router = useRouter();

  return (
    <AdminPageContainer title="Users">
      <ProfileTable
        onRowClick={(user) => {
          router.push(`/admin/users/${(user as Profile).userId}`);
        }}
        rowActionSections={[
          [
            {
              label: 'View Details',
              icon: <InfoIcon size={14} />,
              onClick: (user) => {
                router.push(`/admin/users/${(user as Profile).userId}`);
              }
            }
          ]
        ]}
      />
    </AdminPageContainer>
  );
}
