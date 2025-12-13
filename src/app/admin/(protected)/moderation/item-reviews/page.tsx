'use client';

import { AdminPageContainer, buildColumnDef, buildEnumFilterComponentOptions, CurbyTableRef } from '@core/components';
import { ReviewStatus, UserRole } from '@core/enumerations';
import { useConfirmDialog } from '@core/providers';
import { ItemReviewService } from '@core/services';
import { ItemReview } from '@core/types';
import { ReviewStatusBadge } from '@features/moderation/components';
import { ItemReviewTable } from '@features/moderation/item-reviews/components';
import { UserSelect } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { Row } from '@tanstack/react-table';
import { InfoIcon, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';

const filterValuesFromEnum = (enumObj: Record<string, string>, excludeValues: string[] = []) => {
  return Object.entries(enumObj).reduce(
    (acc, [key, val]) => {
      if (!excludeValues.includes(val)) {
        acc[key] = val;
      }
      return acc;
    },
    {} as Record<string, string>
  );
};

export default function ItemReviewsPage() {
  const router = useRouter();
  const itemReviewTableRef = useRef<CurbyTableRef<ItemReview>>(null);
  const itemReviewService = useRef(createClientService(ItemReviewService)).current;
  const { open: openConfirmDialog } = useConfirmDialog();

  const assignItemReviewToUser = useCallback(
    async (itemReview: ItemReview) => {
      openConfirmDialog({
        title: 'Assign Item Review',
        message: 'Please select the moderator you want to assign this review to.',
        initialData: {
          userId: itemReview.reviewerId || ''
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
              <label className="font-medium">Moderator User ID</label>
              <UserSelect
                value={formState.userId}
                onSelect={(userId) => setFormState({ userId: userId ?? '' })}
                filters={[{ column: 'role', operator: 'in', value: [UserRole.Admin, UserRole.Moderator] }]}
              />
            </div>
          );
        },
        confirmButtonText: 'Assign',
        variant: 'default',
        onConfirm: async (data: { userId: string }) => {
          await itemReviewService.update(itemReview.id, { reviewerId: data.userId });
          itemReviewTableRef.current?.refresh();
        }
      });
    },
    [itemReviewService, openConfirmDialog]
  );

  const getRowActions = useCallback(
    (row: ItemReview) => {
      return [
        {
          label: 'View details',
          icon: InfoIcon,
          onClick: (row: Row<ItemReview>) => {
            router.push(`/admin/moderation/item-reviews/${row.id}`);
          }
        },
        {
          label: 'Assign',
          icon: UserCheck,
          onClick: () => assignItemReviewToUser(row)
        }
      ];
    },
    [router, assignItemReviewToUser]
  );

  return (
    <AdminPageContainer title="Item Reviews" containerClassName="space-y-6">
      <div className="space-y-2">
        <ItemReviewTable
          ToolbarLeft={({ children }) => {
            return (
              <>
                <h1 className="font-medium">Reviews</h1>
                {children}
              </>
            );
          }}
          restrictiveFilters={[
            {
              column: 'status',
              operator: 'in',
              value: [ReviewStatus.Pending, ReviewStatus.InReview, ReviewStatus.ReviewCompleted]
            }
          ]}
          initialFilters={[
            { column: 'status', operator: 'eq', value: ReviewStatus.Pending },
            { column: 'reviewerId', operator: 'is', value: null }
          ]}
          onRowClick={(row) => {
            router.push(`/admin/moderation/item-reviews/${row.id}`);
          }}
          overrideColumns={[
            buildColumnDef('status', 'Status', itemReviewService, {
              cell: ({ row }) => <ReviewStatusBadge status={row.original.status} />,
              enableColumnFilter: true,
              filterComponentOptions: buildEnumFilterComponentOptions(
                filterValuesFromEnum(ReviewStatus, [
                  ReviewStatus.AppealPending,
                  ReviewStatus.AppealInReview,
                  ReviewStatus.AppealCompleted
                ])
              )
            })
          ]}
          getRowActionMenuItems={(row) => getRowActions(row.original)}
          omitColumns={[
            'appealedBy',
            'appealedAt',
            'appealReviewerId',
            'appealReviewStartedAt',
            'appealReviewCompletedAt',
            'appealReviewOutcome',
            'appealReviewOutcomeAction',
            'appealReviewOutcomeActionTakenAt'
          ]}
          defaultHiddenColumns={[
            'reviewStartedAt',
            'reviewCompletedAt',
            'reviewOutcome',
            'reviewOutcomeAction',
            'reviewOutcomeActionTakenAt',
            'appealable',
            'appealDeadline'
          ]}
          height={500}
        />
      </div>

      <div className="space-y-2">
        <ItemReviewTable
          ToolbarLeft={({ children }) => {
            return (
              <>
                <h1 className="font-medium">Appeal Reviews</h1>
                {children}
              </>
            );
          }}
          restrictiveFilters={[
            {
              column: 'status',
              operator: 'in',
              value: [ReviewStatus.AppealPending, ReviewStatus.AppealInReview, ReviewStatus.AppealCompleted]
            }
          ]}
          initialFilters={[
            { column: 'status', operator: 'eq', value: ReviewStatus.AppealPending },
            { column: 'appealReviewerId', operator: 'is', value: null }
          ]}
          onRowClick={(row) => {
            router.push(`/admin/moderation/item-reviews/${row.id}`);
          }}
          overrideColumns={[
            buildColumnDef('status', 'Status', itemReviewService, {
              cell: ({ row }) => <ReviewStatusBadge status={row.original.status} />,
              filterComponentOptions: buildEnumFilterComponentOptions(
                filterValuesFromEnum(ReviewStatus, [
                  ReviewStatus.Pending,
                  ReviewStatus.InReview,
                  ReviewStatus.ReviewCompleted
                ])
              )
            })
          ]}
          getRowActionMenuItems={(row) => getRowActions(row.original)}
          defaultHiddenColumns={[
            'triggerType',
            'triggerData',
            'triggerReason',
            'reviewerId',
            'reviewStartedAt',
            'reviewCompletedAt',
            'reviewNotes',
            'reviewOutcome',
            'reviewOutcomeReason',
            'reviewOutcomeAction',
            'reviewOutcomeActionTakenAt',
            'reviewOutcomeComments',
            'reviewOutcomeMessageToUser',
            'appealable',
            'appealDeadline',
            'appealReviewStartedAt',
            'appealReviewCompletedAt',
            'appealReviewNotes',
            'appealReviewOutcome',
            'appealReviewOutcomeReason',
            'appealReviewOutcomeAction',
            'appealReviewOutcomeActionTakenAt',
            'appealReviewOutcomeComments',
            'appealReviewOutcomeMessageToUser'
          ]}
          height={500}
        />
      </div>
    </AdminPageContainer>
  );
}

/*
  [
    'itemId',
    'status',
    'triggerType',
    'triggerData',
    'triggerReason',
    'reviewerId',
    'reviewStartedAt',
    'reviewCompletedAt',
    'reviewNotes',
    'reviewOutcome',
    'reviewOutcomeReason',
    'reviewOutcomeAction',
    'reviewOutcomeActionTakenAt',
    'reviewOutcomeComments',
    'reviewOutcomeMessageToUser',
    'appealable',
    'appealDeadline',
    'appealedBy',
    'appealReason',
    'appealedAt',
    'appealReviewerId',
    'appealReviewStartedAt',
    'appealReviewCompletedAt',
    'appealReviewNotes',
    'appealReviewOutcome',
    'appealReviewOutcomeReason',
    'appealReviewOutcomeAction',
    'appealReviewOutcomeActionTakenAt',
    'appealReviewOutcomeComments',
    'appealReviewOutcomeMessageToUser'
  ]
*/
