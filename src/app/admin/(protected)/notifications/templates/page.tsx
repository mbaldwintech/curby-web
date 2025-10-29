'use client';

import { AdminPageContainer } from '@core/components';
import { NotificationTemplateTable } from '@features/notifications/components';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotificationTemplatesPage() {
  const router = useRouter();

  return (
    <AdminPageContainer title="Notification Templates">
      <NotificationTemplateTable
        onRowClick={(template) => {
          router.push(`/admin/notifications/templates/${template.id}`);
        }}
        getRowActionMenuItems={() => [
          {
            label: 'View Details',
            icon: InfoIcon,
            onClick: (template) => {
              router.push(`/admin/notifications/templates/${template.id}`);
            }
          }
        ]}
      />
    </AdminPageContainer>
  );
}
