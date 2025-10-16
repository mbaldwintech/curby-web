'use client';

import { AdminPageContainer, NotificationTable } from '@core/components';
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
        rowActionSections={[
          [
            {
              label: 'View Details',
              icon: <InfoIcon size={14} />,
              onClick: (template) => {
                router.push(`/admin/notifications/${template.id}`);
              }
            }
          ]
        ]}
      />
    </AdminPageContainer>
  );
}
