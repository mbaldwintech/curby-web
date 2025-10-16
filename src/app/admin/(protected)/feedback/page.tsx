'use client';

import { AdminPageContainer, FeedbackTable } from '@core/components';
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
        rowActionSections={[
          [
            {
              label: 'View Details',
              icon: <InfoIcon size={14} />,
              onClick: (feedback) => {
                router.push(`/admin/feedback/${feedback.id}`);
              }
            }
          ]
        ]}
      />
    </AdminPageContainer>
  );
}
