'use client';

import { AdminPageContainer } from '@core/components';
import { MediaTable } from '@features/media/components';
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
            label: 'View details',
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
