'use client';

import { AdminPageContainer, MediaTable } from '@core/components';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MediaPage() {
  const router = useRouter();

  return (
    <AdminPageContainer title="Media">
      <MediaTable
        onRowClick={(media) => {
          router.push(`/admin/media/${media.id}`);
        }}
        getRowActionMenuItems={() => [
          {
            label: 'View Details',
            icon: InfoIcon,
            onClick: (media) => {
              router.push(`/admin/media/${media.id}`);
            }
          }
        ]}
      />
    </AdminPageContainer>
  );
}
