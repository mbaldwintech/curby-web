'use client';

import { AdminPageContainer } from '@core/components';
import { TutorialViewTable } from '@features/tutorials/components';

export default function TutorialViewsPage() {
  return (
    <AdminPageContainer title="Tutorial Views">
      <TutorialViewTable />
    </AdminPageContainer>
  );
}
