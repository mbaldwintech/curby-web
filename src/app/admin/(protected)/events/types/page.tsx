'use client';

import { AdminPageContainer, Button, CurbyTableRef, RowMenuItem } from '@core/components';
import { useConfirmDialog } from '@core/providers';
import {
  CurbyCoinTransactionTypeService,
  EventService,
  EventTypeService,
  NotificationTemplateService
} from '@core/services';
import { EventType } from '@core/types';
import { EventTypePanel, EventTypePanelRef, EventTypeTable } from '@features/events/components';
import { createClientService } from '@supa/utils/client';
import { InfoIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useRef } from 'react';

export default function EventTypesPage() {
  const eventTypeService = useRef(createClientService(EventTypeService)).current;
  const eventService = useRef(createClientService(EventService)).current;
  const curbyCoinTransactionTypeService = useRef(createClientService(CurbyCoinTransactionTypeService)).current;
  const notificationTemplateService = useRef(createClientService(NotificationTemplateService)).current;
  const eventTypeTableRef = useRef<CurbyTableRef<EventType>>(null);
  const eventTypePanelRef = useRef<EventTypePanelRef>(null);
  const { open: openConfirmDialog } = useConfirmDialog();

  const getCanDelete = async (eventTypeId: string): Promise<boolean> => {
    try {
      const [eventsExist, curbyCoinTransactionTypesExist, notificationTemplatesExist] = await Promise.all([
        eventService.exists({ column: 'eventTypeId', operator: 'eq', value: eventTypeId }),
        curbyCoinTransactionTypeService.exists({ column: 'eventTypeId', operator: 'eq', value: eventTypeId }),
        notificationTemplateService.exists({ column: 'eventTypeId', operator: 'eq', value: eventTypeId })
      ]);
      return !eventsExist && !curbyCoinTransactionTypesExist && !notificationTemplatesExist;
    } catch (error) {
      console.error('Error checking tutorial views:', error);
      return false;
    }
  };

  return (
    <AdminPageContainer title="Event Types">
      <EventTypeTable
        ref={eventTypeTableRef}
        height={500}
        onRowClick={(event) => {
          eventTypePanelRef.current?.open(event.id);
        }}
        getRowActionMenuItems={async (row) => {
          const menuItems: RowMenuItem<EventType>[] = [
            {
              label: 'View Details',
              icon: InfoIcon,
              onClick: ({ id }) => eventTypePanelRef.current?.open(id)
            }
          ];

          const canDelete = await getCanDelete(row.id);
          if (canDelete) {
            menuItems.push({
              label: 'Delete Event Type',
              variant: 'destructive',
              icon: TrashIcon,
              onClick: ({ id }) => {
                openConfirmDialog({
                  title: 'Delete Event Type',
                  message: 'Are you sure you want to delete this Event Type? This action cannot be undone.',
                  confirmButtonText: 'Delete',
                  variant: 'destructive',
                  onConfirm: async () => {
                    await eventTypeService.delete(id);
                    eventTypeTableRef.current?.refresh();
                  }
                });
              }
            });
          }

          return menuItems;
        }}
        ToolbarRight={({ children }) => (
          <>
            {children}
            <Button size="sm" onClick={() => eventTypePanelRef.current?.open()}>
              <PlusIcon />
            </Button>
          </>
        )}
      />

      <EventTypePanel ref={eventTypePanelRef} onClose={eventTypeTableRef.current?.refresh} />
    </AdminPageContainer>
  );
}
