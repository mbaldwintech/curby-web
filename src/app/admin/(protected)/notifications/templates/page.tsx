'use client';

import { AdminPageContainer, NotificationTemplateTable } from '@core/components';
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
        rowActionSections={[
          [
            {
              label: 'View Details',
              icon: <InfoIcon size={14} />,
              onClick: (template) => {
                router.push(`/admin/notifications/templates/${template.id}`);
              }
            }
          ]
        ]}
      />
    </AdminPageContainer>
  );
}
