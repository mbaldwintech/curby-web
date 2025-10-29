'use client';

import { AdminPageContainer } from '@core/components';
import { NotificationTable } from '@features/notifications/components';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <AdminPageContainer title="Notifications">
      <NotificationTable
        onRowClick={(template) => {
          router.push(`/admin/notifications/${template.id}`);
        }}
        getRowActionMenuItems={() => [
          {
            label: 'View Details',
            icon: InfoIcon,
            onClick: (template) => {
              router.push(`/admin/notifications/${template.id}`);
            }
          }
        ]}
      />
    </AdminPageContainer>
  );
}
