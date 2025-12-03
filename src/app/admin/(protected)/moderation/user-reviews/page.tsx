'use client';

import { AdminPageContainer, buildColumnDef, buildEnumFilterComponentOptions, CurbyTableRef } from '@core/components';
import { ReviewStatus, UserRole } from '@core/enumerations';
import { useConfirmDialog } from '@core/providers';
import { UserReviewService } from '@core/services';
import { UserReview } from '@core/types';
import { ReviewStatusBadge } from '@features/moderation/components';
import { UserReviewTable } from '@features/moderation/user-reviews/components';
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

export default function UserReviewsPage() {
  const router = useRouter();
  const userReviewTableRef = useRef<CurbyTableRef<UserReview>>(null);
  const userReviewService = useRef(createClientService(UserReviewService)).current;
  const { open: openConfirmDialog } = useConfirmDialog();

  const assignUserReviewToUser = useCallback(
    async (userReview: UserReview) => {
      openConfirmDialog({
        title: 'Assign User Review',
        message: 'Please select the moderator you want to assign this review to.',
        initialData: {
          userId: userReview.reviewerId || ''
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
          await userReviewService.update(userReview.id, { reviewerId: data.userId });
          userReviewTableRef.current?.refresh();
        }
      });
    },
    [userReviewService, openConfirmDialog]
  );

  const getRowActions = useCallback(
    (row: UserReview) => {
      return [
        {
          label: 'View details',
          icon: InfoIcon,
          onClick: (row: Row<UserReview>) => {
            router.push(`/admin/moderation/user-reviews/${row.id}`);
          }
        },
        {
          label: 'Assign',
          icon: UserCheck,
          onClick: () => assignUserReviewToUser(row)
        }
      ];
    },
    [router, assignUserReviewToUser]
  );

  return (
    <AdminPageContainer title="User Reviews" containerClassName="space-y-6">
      <div className="space-y-2">
        <UserReviewTable
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
            router.push(`/admin/moderation/user-reviews/${row.id}`);
          }}
          overrideColumns={[
            buildColumnDef('status', 'Status', userReviewService, {
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
        <UserReviewTable
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
            router.push(`/admin/moderation/user-reviews/${row.id}`);
          }}
          overrideColumns={[
            buildColumnDef('status', 'Status', userReviewService, {
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
