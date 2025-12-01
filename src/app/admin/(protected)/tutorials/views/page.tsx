'use client';

import { AdminPageContainer } from '@core/components';
import { TutorialViewTable } from '@features/tutorials/components';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TutorialViewsPage() {
  const router = useRouter();

  return (
    <AdminPageContainer title="Tutorial Views">
      <TutorialViewTable
        onRowClick={(tutorialView: { id: string }) => {
          router.push(`/admin/tutorials/views/${tutorialView.id}`);
        }}
        getRowActionMenuItems={() => [
          {
            label: 'View Details',
            icon: InfoIcon,
            onClick: (tutorialView: { id: string }) => {
              router.push(`/admin/tutorials/views/${tutorialView.id}`);
            }
          }
        ]}
      />
    </AdminPageContainer>
  );
}
