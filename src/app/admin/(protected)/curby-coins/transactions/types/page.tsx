'use client';

import { AdminPageContainer, Button, CurbyTableRef, RowMenuItem } from '@core/components';
import { useConfirmDialog } from '@core/providers';
import { CurbyCoinTransactionService, CurbyCoinTransactionTypeService } from '@core/services';
import { CurbyCoinTransactionType } from '@core/types';
import {
  CurbyCoinTransactionTypePanel,
  CurbyCoinTransactionTypePanelRef,
  CurbyCoinTransactionTypeTable
} from '@features/curby-coins/components';
import { createClientService } from '@supa/utils/client';
import { InfoIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

export default function CurbyCoinTransactionTypesPage() {
  const router = useRouter();
  const curbyCoinTransactionTypeService = useRef(createClientService(CurbyCoinTransactionTypeService)).current;
  const curbyCoinTransactionService = useRef(createClientService(CurbyCoinTransactionService)).current;
  const curbyCoinTransactionTypeTableRef = useRef<CurbyTableRef<CurbyCoinTransactionType>>(null);
  const curbyCoinTransactionTypePanelRef = useRef<CurbyCoinTransactionTypePanelRef>(null);
  const { open: openConfirmDialog } = useConfirmDialog();

  const getCanDelete = async (curbyCoinTransactionTypeId: string): Promise<boolean> => {
    try {
      const transactionsExist = await curbyCoinTransactionService.exists({
        column: 'curbyCoinTransactionTypeId',
        operator: 'eq',
        value: curbyCoinTransactionTypeId
      });
      return !transactionsExist;
    } catch (error) {
      console.error('Error checking curby coin transactions:', error);
      return false;
    }
  };

  return (
    <AdminPageContainer title="Curby Coin Transaction Types">
      <CurbyCoinTransactionTypeTable
        ref={curbyCoinTransactionTypeTableRef}
        height={500}
        onRowClick={(event) => {
          curbyCoinTransactionTypePanelRef.current?.open(event.id);
        }}
        getRowActionMenuItems={async (row) => {
          const menuItems: RowMenuItem<CurbyCoinTransactionType>[] = [
            {
              label: 'Go to details',
              icon: InfoIcon,
              onClick: ({ id }) => router.push(`/admin/curby-coins/transactions/types/${id}`)
            },
            {
              label: 'Edit in panel',
              icon: InfoIcon,
              onClick: ({ id }) => curbyCoinTransactionTypePanelRef.current?.open(id)
            }
          ];

          const canDelete = await getCanDelete(row.id);
          if (canDelete) {
            menuItems.push({
              label: 'Delete Transaction Type',
              variant: 'destructive',
              icon: TrashIcon,
              onClick: ({ id }) => {
                openConfirmDialog({
                  title: 'Delete Curby Coin Transaction Type',
                  message:
                    'Are you sure you want to delete this curby coin transaction type? This action cannot be undone.',
                  confirmButtonText: 'Delete',
                  variant: 'destructive',
                  onConfirm: async () => {
                    await curbyCoinTransactionTypeService.delete(id);
                    curbyCoinTransactionTypeTableRef.current?.refresh();
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
            <Button size="sm" onClick={() => curbyCoinTransactionTypePanelRef.current?.open()}>
              <PlusIcon />
            </Button>
          </>
        )}
      />

      <CurbyCoinTransactionTypePanel
        ref={curbyCoinTransactionTypePanelRef}
        onClose={() => curbyCoinTransactionTypeTableRef.current?.refresh()}
      />
    </AdminPageContainer>
  );
}
