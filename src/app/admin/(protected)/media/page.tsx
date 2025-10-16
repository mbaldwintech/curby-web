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
        rowActionSections={[
          [
            {
              label: 'View Details',
              icon: <InfoIcon size={14} />,
              onClick: (media) => {
                router.push(`/admin/media/${media.id}`);
              }
            }
          ]
        ]}
      />
    </AdminPageContainer>
  );
}
