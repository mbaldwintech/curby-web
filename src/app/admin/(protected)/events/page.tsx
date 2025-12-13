'use client';

import { AdminPageContainer } from '@core/components';
import { ExtendedEventTable } from '@features/events/components';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EventLogsPage() {
  const router = useRouter();

  return (
    <AdminPageContainer title="Event Logs">
      <ExtendedEventTable
        onRowClick={(event) => {
          router.push(`/admin/events/${event.id}`);
        }}
        getRowActionMenuItems={() => [
          {
            label: 'View details',
            icon: InfoIcon,
            onClick: (event) => {
              router.push(`/admin/events/${event.id}`);
            }
          }
        ]}
      />
    </AdminPageContainer>
  );
}
