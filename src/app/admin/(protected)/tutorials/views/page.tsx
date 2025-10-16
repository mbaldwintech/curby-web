'use client';

import { AdminPageContainer, TutorialViewTable } from '@core/components';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TutorialViewsPage() {
  const router = useRouter();

  return (
    <AdminPageContainer title="Tutorial Views">
      <TutorialViewTable
        onRowClick={(view) => {
          router.push(`/admin/tutorials/views/${view.id}`);
        }}
        rowActionSections={[
          [
            {
              label: 'View Details',
              icon: <InfoIcon size={14} />,
              onClick: (view) => {
                router.push(`/admin/tutorials/views/${view.id}`);
              }
            }
          ]
        ]}
      />
    </AdminPageContainer>
  );
}
