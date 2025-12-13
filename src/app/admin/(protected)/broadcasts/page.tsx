'use client';

import { AdminPageContainer, CurbyTableRef } from '@core/components';
import { Button, RowMenuItem } from '@core/components/base';
import { BroadcastStatus } from '@core/enumerations';
import { BroadcastService } from '@core/services';
import { Broadcast } from '@core/types';
import { BroadcastPanel, BroadcastPanelRef, BroadcastTable } from '@features/broadcasts/components';
import { createClientService } from '@supa/utils/client';
import { Archive, ArrowRight, Info, PlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

export default function BroadcastsPage() {
  const router = useRouter();
  const broadcastService = useRef(createClientService(BroadcastService)).current;
  const tableRef = useRef<CurbyTableRef<Broadcast>>(null);
  const panelRef = useRef<BroadcastPanelRef>(null);

  return (
    <>
      <AdminPageContainer title="Broadcasts">
        <BroadcastTable
          ref={tableRef}
          omitColumns={['title']}
          onRowClick={(broadcast) => {
            router.push(`/admin/broadcasts/${broadcast.id}`);
          }}
          ToolbarRight={({ children }) => (
            <>
              {children}
              <Button onClick={() => panelRef.current?.open()} size="sm">
                <PlusIcon />
              </Button>
            </>
          )}
          getRowActionMenuItems={(row) =>
            [
              {
                label: 'View details',
                icon: Info,
                onClick: () => {
                  panelRef.current?.open(row.original.id);
                }
              },
              {
                label: 'Go to broadcast',
                icon: ArrowRight,
                onClick: () => {
                  router.push(`/admin/broadcasts/${row.original.id}`);
                }
              },
              row.original.status === BroadcastStatus.Archived && {
                label: 'Unarchive',
                icon: Archive,
                onClick: async () => {
                  await broadcastService.update(row.original.id, { status: BroadcastStatus.Draft });
                  tableRef.current?.refresh();
                }
              },
              row.original.status !== BroadcastStatus.Archived && {
                label: 'Archive',
                icon: Archive,
                variant: 'destructive',
                separator: true,
                onClick: async () => {
                  await broadcastService.update(row.original.id, { status: BroadcastStatus.Archived });
                  tableRef.current?.refresh();
                }
              }
            ].filter((opt) => !!opt) as RowMenuItem<Broadcast>[]
          }
        />
      </AdminPageContainer>
      <BroadcastPanel ref={panelRef} onClose={() => tableRef.current?.refresh()} />
    </>
  );
}
