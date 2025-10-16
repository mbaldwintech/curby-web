'use client';

import { AdminPageContainer, ExtendedEventTable } from '@core/components';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EventLogsPage() {
  const router = useRouter();

  return (
    <AdminPageContainer title="Event Logs">
      <ExtendedEventTable
        onRowClick={(event) => {
          router.push(`/admin/events/logs/${event.id}`);
        }}
        rowActionSections={[
          [
            {
              label: 'View Details',
              icon: <InfoIcon size={14} />,
              onClick: (event) => {
                router.push(`/admin/events/logs/${event.id}`);
              }
            }
          ]
        ]}
      />
    </AdminPageContainer>
  );
}
