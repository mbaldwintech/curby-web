'use client';

import {
  buildColumnDef,
  buildEnumFilterComponentOptions,
  CurbyTable,
  CurbyTableProps,
  CurbyTableRef,
  CustomColumnDef,
  PagedAutocompleteFilterComponentOptions
} from '@core/components';
import {
  AppealReviewOutcome,
  ReviewOutcome,
  ReviewStatus,
  ReviewTriggerType,
  UserReviewAppealReviewOutcomeAction,
  UserReviewOutcomeAction,
  UserRole
} from '@core/enumerations';
import { ProfileService, UserReviewService } from '@core/services';
import { UserReview } from '@core/types';
import { ProfileCell } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import {
  AppealReviewOutcomeBadge,
  ReviewOutcomeBadge,
  ReviewStatusBadge,
  ReviewTriggerTypeBadge
} from '../../components';
import { UserReviewAppealReviewOutcomeActionBadge } from './user-review-appeal-review-outcome-action-badge.component';
import { UserReviewOutcomeActionBadge } from './user-review-outcome-action-badge.component';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UserReviewTableProps extends Omit<CurbyTableProps<UserReview>, 'service' | 'columns'> {}

export const UserReviewTable = forwardRef<CurbyTableRef<UserReview>, UserReviewTableProps>(function UserReviewTable(
  props: UserReviewTableProps,
  ref
) {
  const { ...rest } = props;
  const service = useRef(createClientService(UserReviewService)).current;
  const profileService = useRef(createClientService(ProfileService)).current;

  const buildColumn = useCallback(
    <K extends keyof UserReview>(
      key: K,
      header: string,
      options?: Partial<CustomColumnDef<UserReview, UserReview[K]>>
    ) => {
      return buildColumnDef<UserReview, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<UserReview>[] = useMemo(
    () =>
      [
        buildColumn('userId', 'User', {
          cell: ({ row }) => <ProfileCell userId={row.original.userId} />
        }),
        buildColumn('status', 'Status', {
          cell: ({ row }) => <ReviewStatusBadge status={row.original.status} />,
          filterComponentOptions: buildEnumFilterComponentOptions(ReviewStatus)
        }),
        buildColumn('triggerType', 'Trigger Type', {
          cell: ({ row }) => <ReviewTriggerTypeBadge type={row.original.triggerType} />,
          filterComponentOptions: buildEnumFilterComponentOptions(ReviewTriggerType)
        }),
        buildColumn('triggerReason', 'Trigger Reason'),
        buildColumn('reviewerId', 'Reviewer', {
          cell: ({ row }) => <ProfileCell userId={row.original.reviewerId} />,
          filterComponentOptions: {
            getCount: async (query: string) => {
              return profileService.count(undefined, { text: query, columns: ['userId'] });
            },
            fetchOptions: async (query: string, pageIndex: number, pageSize: number) => {
              const items = await profileService.getAllPaged(
                [{ column: 'role', operator: 'in', value: [UserRole.Admin, UserRole.Moderator] }],
                { column: 'userId', ascending: true },
                { pageIndex, pageSize },
                { text: query, columns: ['userId'] }
              );
              const res = items.reduce(
                (acc, item) => {
                  if (!item.userId || acc.some((i) => i.id === item.userId)) {
                    return acc;
                  }
                  acc.push({ id: item.userId, label: item.username });
                  return acc;
                },
                [] as { id: string; label: string }[]
              );
              return res;
            },
            fetchSelectedItem: async (id: string) => {
              const res = await profileService
                .getOneOrNull([{ column: 'userId', operator: 'eq', value: id }])
                .then((item) => {
                  if (item && item.userId) {
                    return { id: item.userId, label: item.username };
                  }
                  return null;
                });
              return res;
            },
            nullable: true,
            nullValueLabel: 'Unassigned'
          } as PagedAutocompleteFilterComponentOptions
        }),
        buildColumn('reviewStartedAt', 'Review Started At', {
          cell: ({ row }) =>
            row.original.reviewStartedAt ? new Date(row.original.reviewStartedAt).toLocaleString() : '-'
        }),
        buildColumn('reviewCompletedAt', 'Review Completed At', {
          cell: ({ row }) =>
            row.original.reviewCompletedAt ? new Date(row.original.reviewCompletedAt).toLocaleString() : '-'
        }),
        buildColumn('reviewOutcome', 'Review Outcome', {
          cell: ({ row }) => <ReviewOutcomeBadge outcome={row.original.reviewOutcome} />,
          filterComponentOptions: buildEnumFilterComponentOptions(ReviewOutcome)
        }),
        buildColumn('reviewOutcomeAction', 'Review Outcome Action', {
          cell: ({ row }) => <UserReviewOutcomeActionBadge action={row.original.reviewOutcomeAction} />,
          filterComponentOptions: buildEnumFilterComponentOptions(UserReviewOutcomeAction)
        }),
        buildColumn('reviewOutcomeActionTakenAt', 'Review Outcome Action Taken At', {
          cell: ({ row }) =>
            row.original.reviewOutcomeActionTakenAt
              ? new Date(row.original.reviewOutcomeActionTakenAt).toLocaleString()
              : '-'
        }),
        buildColumn('appealable', 'Is Appealable', {
          cell: ({ row }) => (row.original.appealable ? 'Yes' : 'No')
        }),
        buildColumn('appealDeadline', 'Appeal Deadline', {
          cell: ({ row }) =>
            row.original.appealDeadline ? new Date(row.original.appealDeadline).toLocaleString() : '-'
        }),
        buildColumn('appealedBy', 'Appealed By', {
          cell: ({ row }) => <ProfileCell userId={row.original.appealedBy} />
        }),
        buildColumn('appealedAt', 'Appealed At', {
          cell: ({ row }) => (row.original.appealedAt ? new Date(row.original.appealedAt).toLocaleString() : '-')
        }),
        buildColumn('appealReviewerId', 'Appeal Reviewer', {
          cell: ({ row }) => <ProfileCell userId={row.original.appealReviewerId} />,
          filterComponentOptions: {
            getCount: async (query: string) => {
              return profileService.count(undefined, { text: query, columns: ['userId'] });
            },
            fetchOptions: async (query: string, pageIndex: number, pageSize: number) => {
              const items = await profileService.getAllPaged(
                [{ column: 'role', operator: 'in', value: [UserRole.Admin, UserRole.Moderator] }],
                { column: 'userId', ascending: true },
                { pageIndex, pageSize },
                { text: query, columns: ['userId'] }
              );
              const res = items.reduce(
                (acc, item) => {
                  if (!item.userId || acc.some((i) => i.id === item.userId)) {
                    return acc;
                  }
                  acc.push({ id: item.userId, label: item.username });
                  return acc;
                },
                [] as { id: string; label: string }[]
              );
              return res;
            },
            fetchSelectedItem: async (id: string) => {
              const res = await profileService
                .getOneOrNull([{ column: 'userId', operator: 'eq', value: id }])
                .then((item) => {
                  if (item && item.userId) {
                    return { id: item.userId, label: item.username };
                  }
                  return null;
                });
              return res;
            },
            nullable: true,
            nullValueLabel: 'Unassigned'
          } as PagedAutocompleteFilterComponentOptions
        }),
        buildColumn('appealReviewStartedAt', 'Appeal Review Started At', {
          cell: ({ row }) =>
            row.original.appealReviewStartedAt ? new Date(row.original.appealReviewStartedAt).toLocaleString() : '-'
        }),
        buildColumn('appealReviewCompletedAt', 'Appeal Review Completed At', {
          cell: ({ row }) =>
            row.original.appealReviewCompletedAt ? new Date(row.original.appealReviewCompletedAt).toLocaleString() : '-'
        }),
        buildColumn('appealReviewOutcome', 'Appeal Review Outcome', {
          cell: ({ row }) => <AppealReviewOutcomeBadge outcome={row.original.appealReviewOutcome} />,
          filterComponentOptions: buildEnumFilterComponentOptions(AppealReviewOutcome)
        }),
        buildColumn('appealReviewOutcomeAction', 'Appeal Review Outcome Action', {
          cell: ({ row }) => (
            <UserReviewAppealReviewOutcomeActionBadge action={row.original.appealReviewOutcomeAction} />
          ),
          filterComponentOptions: buildEnumFilterComponentOptions(UserReviewAppealReviewOutcomeAction)
        }),
        buildColumn('appealReviewOutcomeActionTakenAt', 'Appeal Review Outcome Action Taken At', {
          cell: ({ row }) =>
            row.original.appealReviewOutcomeActionTakenAt
              ? new Date(row.original.appealReviewOutcomeActionTakenAt).toLocaleString()
              : '-'
        })
      ].filter((c) => c !== undefined),
    [buildColumn, profileService]
  );

  return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
});
