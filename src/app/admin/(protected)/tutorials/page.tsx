'use client';

import { AdminPageContainer, Button, CurbyTableRef, RowMenuItem } from '@core/components';
import { useConfirmDialog } from '@core/providers';
import { TutorialService, TutorialViewService } from '@core/services';
import { Tutorial } from '@core/types';
import { TutorialPanel, TutorialPanelRef, TutorialTable, TutorialViewTable } from '@features/tutorials/components';
import { createClientService } from '@supa/utils/client';
import { EyeIcon, InfoIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

export default function TutorialsPage() {
  const router = useRouter();
  const tutorialService = useRef(createClientService(TutorialService)).current;
  const tutorialViewService = useRef(createClientService(TutorialViewService)).current;
  const tutorialTableRef = useRef<CurbyTableRef<Tutorial>>(null);
  const tutorialPanelRef = useRef<TutorialPanelRef>(null);
  const { open: openConfirmDialog } = useConfirmDialog();

  const getCanDelete = async (tutorialId: string): Promise<boolean> => {
    try {
      const viewCount = await tutorialViewService.count({ column: 'tutorialId', operator: 'eq', value: tutorialId });
      return viewCount === 0;
    } catch (error) {
      console.error('Error checking tutorial views:', error);
      return false;
    }
  };

  return (
    <AdminPageContainer title="Tutorials">
      <TutorialTable
        ref={tutorialTableRef}
        onRowClick={(tutorial) => {
          tutorialPanelRef.current?.open(tutorial.id);
        }}
        getRowActionMenuItems={async (row) => {
          const menuItems: RowMenuItem<Tutorial>[] = [
            {
              label: 'View Details',
              icon: InfoIcon,
              onClick: ({ id }) => tutorialPanelRef.current?.open(id)
            },
            {
              label: 'View Tutorial Views',
              icon: EyeIcon,
              onClick: ({ id }) => tutorialTableRef.current?.toggleExpand(id)
            }
          ];

          const canDelete = await getCanDelete(row.id);
          if (canDelete) {
            menuItems.push({
              label: 'Delete Tutorial',
              variant: 'destructive',
              icon: TrashIcon,
              onClick: ({ id }) => {
                openConfirmDialog({
                  title: 'Delete Tutorial',
                  message: 'Are you sure you want to delete this tutorial? This action cannot be undone.',
                  confirmButtonText: 'Delete',
                  variant: 'destructive',
                  onConfirm: async () => {
                    await tutorialService.delete(id);
                    tutorialTableRef.current?.refresh();
                  }
                });
              }
            });
          }

          return menuItems;
        }}
        getExpandedContent={(row) => {
          return (
            <div className="flex flex-col gap-2 py-4 px-6">
              <TutorialViewTable
                restrictiveFilters={[{ column: 'tutorialId', operator: 'eq', value: row.id }]}
                maxHeight={200}
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
            </div>
          );
        }}
        ToolbarRight={({ children }) => (
          <>
            {children}
            <Button size="sm" onClick={() => tutorialPanelRef.current?.open()}>
              <PlusIcon />
            </Button>
          </>
        )}
        height={500}
      />

      <TutorialPanel ref={tutorialPanelRef} onClose={tutorialTableRef.current?.refresh} />
    </AdminPageContainer>
  );
}
