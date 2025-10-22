'use client';

import { AdminPageContainer } from '@core/components';
import { FeedbackTable } from '@features/feedback/components';
import { InfoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FeedbackPage() {
  const router = useRouter();

  return (
    <AdminPageContainer title="Feedback">
      <FeedbackTable
        onRowClick={(feedback) => {
          router.push(`/admin/feedback/${feedback.id}`);
        }}
        getRowActionMenuItems={() => [
          {
            label: 'View Details',
            icon: InfoIcon,
            onClick: (feedback) => {
              router.push(`/admin/feedback/${feedback.id}`);
            }
          }
        ]}
      />
    </AdminPageContainer>
  );
}
