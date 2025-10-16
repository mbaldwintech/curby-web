'use client';

import {
  AdminPageContainer,
  CurbyTableRef,
  TutorialDetailPanel,
  TutorialDetailPanelRef,
  TutorialTable,
  TutorialViewsPanel,
  TutorialViewsPanelRef
} from '@core/components';
import { Tutorial } from '@core/types';
import { EyeIcon, InfoIcon } from 'lucide-react';
import { useRef } from 'react';

export default function TutorialsPage() {
  const tutorialTableRef = useRef<CurbyTableRef<Tutorial>>(null);
  const tutorialDetailPanelRef = useRef<TutorialDetailPanelRef>(null);
  const tutorialViewsPanelRef = useRef<TutorialViewsPanelRef>(null);

  return (
    <AdminPageContainer title="Tutorials">
      <TutorialTable
        ref={tutorialTableRef}
        onRowClick={(tutorial) => {
          tutorialDetailPanelRef.current?.open(tutorial.id);
        }}
        rowActionSections={[
          [
            {
              label: 'View Details',
              icon: <InfoIcon size={14} />,
              onClick: (tutorial) => {
                tutorialDetailPanelRef.current?.open(tutorial.id);
              }
            },
            {
              label: 'View Tutorial Views',
              icon: <EyeIcon size={14} />,
              onClick: (tutorial) => {
                tutorialViewsPanelRef.current?.open(tutorial.id);
              }
            }
          ]
        ]}
      />

      <TutorialDetailPanel ref={tutorialDetailPanelRef} onClose={tutorialTableRef.current?.refresh} />

      <TutorialViewsPanel ref={tutorialViewsPanelRef} />
    </AdminPageContainer>
  );
}
