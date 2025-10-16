'use client';

import { Badge, CustomColumnDef } from '@common/components';
import { Filters } from '@supa/services';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { UserReviewService } from '../../services';
import { UserReview } from '../../types';
import { ProfileCell } from '../cells';
import { buildColumnDef, CurbyTable, CurbyTableRef, CurbyTableRowAction } from '../curby-table';

export interface UserReviewTableProps {
  defaultFilters?: Filters<UserReview>;
  onRowClick?: (userReview: UserReview) => void;
  rowActionSections?: CurbyTableRowAction<UserReview>[][];
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  height?: number;
  maxHeight?: number;
  extraColumns?: CustomColumnDef<UserReview>[];
}

export const UserReviewTable = forwardRef<CurbyTableRef<UserReview>, UserReviewTableProps>(function UserReviewTable(
  {
    defaultFilters,
    onRowClick,
    rowActionSections,
    toolbarLeft,
    toolbarRight,
    height = 500,
    maxHeight,
    extraColumns = []
  }: UserReviewTableProps,
  ref
) {
  const service = useRef(createClientService(UserReviewService)).current;

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
    () => [
      buildColumn('userId', 'User', {
        cell: ({ row }) => <ProfileCell userId={row.original.userId} />
      }),
      buildColumn('status', 'Status', {
        cell: ({ row }) =>
          row.original.status === 'pending' ? (
            <Badge className="text-orange-600 bg-orange-100 px-1.5">Pending</Badge>
          ) : row.original.status === 'in_review' ? (
            <Badge className="text-yellow-600 bg-yellow-100 px-1.5">Skipped</Badge>
          ) : row.original.status === 'review_completed' ? (
            <Badge className="text-muted-foreground bg-muted/20 px-1.5">Not Started</Badge>
          ) : row.original.status === 'appeal_pending' ? (
            <Badge className="text-blue-600 bg-blue-100 px-1.5">Completed</Badge>
          ) : row.original.status === 'appeal_in_review' ? (
            <Badge className="text-purple-600 bg-purple-100 px-1.5">Appeal In Review</Badge>
          ) : row.original.status === 'appeal_completed' ? (
            <Badge className="text-green-600 bg-green-100 px-1.5">Appeal Completed</Badge>
          ) : (
            row.original.status
          )
      }),
      buildColumn('triggerType', 'Trigger Type', {
        cell: ({ row }) =>
          row.original.triggerType === 'auto_flag' ? (
            <Badge className="text-orange-600 bg-orange-100 px-1.5">Auto Flagged</Badge>
          ) : row.original.triggerType === 'manual' ? (
            <Badge className="text-yellow-600 bg-yellow-100 px-1.5">Manual</Badge>
          ) : row.original.triggerType === 'reports' ? (
            <Badge className="text-muted-foreground bg-muted/20 px-1.5">Reported</Badge>
          ) : (
            row.original.triggerType
          )
      }),
      buildColumn('triggerReason', 'Trigger Reason'),
      buildColumn('reviewerId', 'Reviewer', {
        cell: ({ row }) => <ProfileCell userId={row.original.reviewerId} />
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
        cell: ({ row }) =>
          row.original.reviewOutcome === 'resolved' ? (
            <Badge className="text-green-600 bg-green-100 px-1.5">Resolved</Badge>
          ) : row.original.reviewOutcome === 'dismissed' ? (
            <Badge className="text-blue-600 bg-blue-100 px-1.5">Dismissed</Badge>
          ) : (
            row.original.reviewOutcome
          )
      }),
      buildColumn('reviewOutcomeAction', 'Review Outcome Action', {
        cell: ({ row }) =>
          row.original.reviewOutcomeAction === 'no_action' ? (
            <Badge className="text-muted-foreground bg-muted/20 px-1.5">No Action</Badge>
          ) : row.original.reviewOutcomeAction === 'user_warning' ? (
            <Badge className="text-red-600 bg-red-100 px-1.5">User Warning</Badge>
          ) : row.original.reviewOutcomeAction === 'user_suspension' ? (
            <Badge className="text-green-600 bg-green-100 px-1.5">User Suspension</Badge>
          ) : row.original.reviewOutcomeAction === 'user_ban' ? (
            <Badge className="text-purple-600 bg-purple-100 px-1.5">User Ban</Badge>
          ) : (
            row.original.reviewOutcomeAction
          )
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
        cell: ({ row }) => (row.original.appealDeadline ? new Date(row.original.appealDeadline).toLocaleString() : '-')
      }),
      buildColumn('appealedBy', 'Appealed By', {
        cell: ({ row }) => <ProfileCell userId={row.original.appealedBy} />
      }),
      buildColumn('appealedAt', 'Appealed At', {
        cell: ({ row }) => (row.original.appealedAt ? new Date(row.original.appealedAt).toLocaleString() : '-')
      }),
      buildColumn('appealReviewerId', 'Appeal Reviewer', {
        cell: ({ row }) => <ProfileCell userId={row.original.appealReviewerId} />
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
        cell: ({ row }) =>
          row.original.appealReviewOutcome === 'appeal_granted' ? (
            <Badge className="text-green-600 bg-green-100 px-1.5">Appeal Granted</Badge>
          ) : row.original.appealReviewOutcome === 'appeal_denied' ? (
            <Badge className="text-red-600 bg-red-100 px-1.5">Appeal Denied</Badge>
          ) : row.original.appealReviewOutcome === 'partial_relief' ? (
            <Badge className="text-yellow-600 bg-yellow-100 px-1.5">Partial Relief</Badge>
          ) : (
            row.original.appealReviewOutcome
          )
      }),
      buildColumn('appealReviewOutcomeAction', 'Appeal Review Outcome Action', {
        cell: ({ row }) =>
          row.original.appealReviewOutcomeAction === 'no_action' ? (
            <Badge className="text-muted-foreground bg-muted/20 px-1.5">No Action</Badge>
          ) : row.original.appealReviewOutcomeAction === 'user_warning' ? (
            <Badge className="text-yellow-600 bg-yellow-100 px-1.5">Warning</Badge>
          ) : row.original.appealReviewOutcomeAction === 'user_suspension_lifted' ? (
            <Badge className="text-green-600 bg-green-100 px-1.5">Suspension Lifted</Badge>
          ) : row.original.appealReviewOutcomeAction === 'user_ban_lifted' ? (
            <Badge className="text-purple-600 bg-purple-100 px-1.5">Ban Lifted</Badge>
          ) : (
            row.original.appealReviewOutcomeAction
          )
      }),
      buildColumn('appealReviewOutcomeActionTakenAt', 'Appeal Review Outcome Action Taken At', {
        cell: ({ row }) =>
          row.original.appealReviewOutcomeActionTakenAt
            ? new Date(row.original.appealReviewOutcomeActionTakenAt).toLocaleString()
            : '-'
      }),
      ...extraColumns
    ],
    [buildColumn, extraColumns]
  );

  return (
    <CurbyTable
      ref={ref}
      service={service}
      defaultFilters={defaultFilters}
      columns={columns}
      height={height}
      maxHeight={maxHeight}
      onRowClick={onRowClick}
      rowActionSections={rowActionSections}
      toolbarLeft={toolbarLeft}
      toolbarRight={toolbarRight}
    />
  );
});
