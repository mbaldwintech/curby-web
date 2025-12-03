'use client';

import { AdminPageContainer, Button, CurbyTableRef } from '@core/components';
import { NotificationTemplate } from '@core/types';
import {
  NotificationTemplatePanel,
  NotificationTemplatePanelRef,
  NotificationTemplateTable
} from '@features/notifications/components';
import { ArrowRight, InfoIcon, PlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

export default function NotificationTemplatesPage() {
  const router = useRouter();
  const notificationTemplateTableRef = useRef<CurbyTableRef<NotificationTemplate> | null>(null);
  const notificationTemplatePanelRef = useRef<NotificationTemplatePanelRef | null>(null);

  return (
    <AdminPageContainer title="Notification Templates">
      <NotificationTemplateTable
        ref={notificationTemplateTableRef}
        onRowClick={(template) => {
          notificationTemplatePanelRef.current?.open(template.id);
        }}
        getRowActionMenuItems={() => [
          {
            label: 'View Details',
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
        ]}
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
