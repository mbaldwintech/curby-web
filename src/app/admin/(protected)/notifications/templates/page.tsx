'use client';

import { AdminPageContainer, Button, CurbyTableRef, RowMenuItem } from '@core/components';
import { useConfirmDialog } from '@core/providers';
import { NotificationService, NotificationTemplateService } from '@core/services';
import { NotificationTemplate } from '@core/types';
import {
  NotificationTemplatePanel,
  NotificationTemplatePanelRef,
  NotificationTemplateTable
} from '@features/notifications/components';
import { createClientService } from '@supa/utils/client';
import { ArrowRight, InfoIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

export default function NotificationTemplatesPage() {
  const router = useRouter();
  const notificationService = useRef(createClientService(NotificationService)).current;
  const notificationTemplateService = useRef(createClientService(NotificationTemplateService)).current;
  const notificationTemplateTableRef = useRef<CurbyTableRef<NotificationTemplate> | null>(null);
  const notificationTemplatePanelRef = useRef<NotificationTemplatePanelRef | null>(null);
  const { open: openConfirmDialog } = useConfirmDialog();

  const getCanDelete = async (templateId: string): Promise<boolean> => {
    try {
      const notificationsExist = await notificationService.exists({
        column: 'notificationTemplateId',
        operator: 'eq',
        value: templateId
      });
      return !notificationsExist;
    } catch (error) {
      console.error('Error checking tutorial views:', error);
      return false;
    }
  };

  return (
    <AdminPageContainer title="Notification Templates">
      <NotificationTemplateTable
        ref={notificationTemplateTableRef}
        onRowClick={(template) => {
          notificationTemplatePanelRef.current?.open(template.id);
        }}
        getRowActionMenuItems={async (row) => {
          const opts: RowMenuItem<NotificationTemplate>[] = [
            {
              label: 'View details',
              icon: InfoIcon,
              onClick: (template) => {
                notificationTemplatePanelRef.current?.open(template.id);
              }
            },
            {
              label: 'Go to template',
              icon: ArrowRight,
              onClick: (template) => {
                router.push(`/admin/notifications/templates/${template.id}`);
              }
            }
          ];

          const canDelete = await getCanDelete(row.id);
          if (canDelete) {
            opts.push({
              label: 'Delete template',
              variant: 'destructive',
              icon: TrashIcon,
              onClick: ({ id }) => {
                openConfirmDialog({
                  title: 'Delete template',
                  message: 'Are you sure you want to delete this Notification Template? This action cannot be undone.',
                  confirmButtonText: 'Delete',
                  variant: 'destructive',
                  onConfirm: async () => {
                    await notificationTemplateService.delete(id);
                    notificationTemplateTableRef.current?.refresh();
                  }
                });
              }
            });
          }

          return opts;
        }}
        ToolbarRight={({ children }) => (
          <>
            {children}
            <Button size="sm" onClick={() => notificationTemplatePanelRef.current?.open()}>
              <PlusIcon />
            </Button>
          </>
        )}
      />
      <NotificationTemplatePanel
        ref={notificationTemplatePanelRef}
        onClose={notificationTemplateTableRef.current?.refresh}
      />
    </AdminPageContainer>
  );
}
