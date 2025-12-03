'use client';

import { AdminPageContainer, CurbyTableRef } from '@core/components';
import { SupportRequestStatus, UserRole } from '@core/enumerations';
import { useConfirmDialog } from '@core/providers';
import { SupportRequestService } from '@core/services';
import { SupportRequest } from '@core/types';
import { SupportRequestTable } from '@features/support/components';
import { UserSelect } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { Row } from '@tanstack/react-table';
import { InfoIcon, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';

export default function SupportRequestsPage() {
  const router = useRouter();
  const supportRequestTableRef = useRef<CurbyTableRef<SupportRequest>>(null);
  const supportRequestService = useRef(createClientService(SupportRequestService)).current;
  const { open: openConfirmDialog } = useConfirmDialog();

  const assignSupportRequestToUser = useCallback(
    async (supportRequest: SupportRequest) => {
      openConfirmDialog({
        title: 'Assign Support Request',
        message: 'Please select the support agent to assign this request to.',
        initialData: {
          userId: supportRequest.assignedTo || ''
        },
        Body: ({
          formState,
          setFormState
        }: {
          formState: { userId: string };
          setFormState: React.Dispatch<React.SetStateAction<{ userId: string }>>;
        }) => {
          return (
            <div className="flex flex-col gap-4">
              <label className="font-medium">Support Agent ID</label>
              <UserSelect
                value={formState.userId}
                onSelect={(userId) => setFormState({ userId: userId ?? '' })}
                filters={[{ column: 'role', operator: 'in', value: [UserRole.Admin, UserRole.Support] }]}
              />
            </div>
          );
        },
        confirmButtonText: 'Assign',
        variant: 'default',
        onConfirm: async (data: { userId: string }) => {
          await supportRequestService.update(supportRequest.id, {
            assignedTo: data.userId,
            assignedAt: new Date().toISOString()
          });
          supportRequestTableRef.current?.refresh();
        }
      });
    },
    [supportRequestService, openConfirmDialog]
  );

  const getRowActions = useCallback(
    (row: SupportRequest) => {
      return [
        {
          label: 'View details',
          icon: InfoIcon,
          onClick: (row: Row<SupportRequest>) => {
            router.push(`/admin/support/requests/${row.id}`);
          }
        },
        {
          label: 'Assign',
          icon: UserCheck,
          onClick: () => assignSupportRequestToUser(row)
        }
      ];
    },
    [router, assignSupportRequestToUser]
  );

  return (
    <AdminPageContainer title="Support Requests">
      <SupportRequestTable
        initialFilters={[
          {
            column: 'status',
            operator: 'in',
            value: [SupportRequestStatus.Open, SupportRequestStatus.InProgress, SupportRequestStatus.WaitingForUser]
          }
        ]}
        onRowClick={(row) => {
          router.push(`/admin/support/requests/${row.id}`);
        }}
        getRowActionMenuItems={(row) => getRowActions(row.original)}
        defaultHiddenColumns={[
          'message',
          'assignedAt',
          'resolvedAt',
          'resolvedBy',
          'resolutionNotes',
          'customerSatisfaction',
          'customerFeedback',
          'appVersion',
          'deviceInfo',
          'userAgent',
          'errorLogs',
          'reproductionSteps',
          'expectedBehavior',
          'actualBehavior',
          'escalatedAt',
          'escalationReason',
          'internalNotes',
          'tags',
          'relatedSupportRequestIds'
        ]}
        height={500}
      />
    </AdminPageContainer>
  );
}
