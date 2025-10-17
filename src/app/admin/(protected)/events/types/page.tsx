'use client';

import { AdminPageContainer, EventTypeTable } from '@core/components';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EventTypesPage() {
  const router = useRouter();

  return (
    <AdminPageContainer title="Event Types">
      <EventTypeTable
        onRowClick={(event) => {
          router.push(`/admin/events/types/${event.id}`);
        }}
        getRowActionMenuItems={() => [
          {
            label: 'View Details',
            icon: InfoIcon,
            onClick: (event) => {
              router.push(`/admin/events/types/${event.id}`);
            }
          }
        ]}
      />
    </AdminPageContainer>
  );
}
