'use client';

import { DataTable } from '@core/components';
import { Skeleton } from '@core/components/base/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@core/components/base/tooltip';
import { ItemReviewAppealReviewOutcomeAction, ItemReviewOutcomeAction } from '@core/enumerations';
import { ExtendedItemService, FalseTakingService, ItemReportService, ItemReviewService } from '@core/services';
import { createClientService } from '@supa/utils/client';
import { Row } from '@tanstack/react-table';
import { AlertCircle, CheckCircle, Flag, Package, Shield, User, XCircle } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createLogger, formatDateTime } from '@core/utils';

const logger = createLogger('ItemActivityTable');

const toDate = (date: Date | string) => {
  return typeof date === 'string' ? new Date(date) : date;
};

enum ActivityItemType {
  // Poster activities
  ItemPosted = 'item_posted',
  ItemConfirmedTaken = 'item_confirmed_taken',
  ItemTakingConfirmedFalse = 'item_taking_confirmed_false',
  // Taker activities
  ItemTaken = 'item_taken',
  // Other user activities
  ItemReported = 'item_reported',
  // Moderation activities
  ItemReviewOpened = 'item_review_opened',
  ItemReviewStarted = 'item_review_started',
  ItemReviewCompleted = 'item_review_completed',
  ItemReviewActionTaken = 'item_review_action_taken',
  ItemReviewAppealed = 'item_review_decision_appealed',
  ItemReviewAppealReviewStarted = 'item_review_appeal_review_started',
  ItemReviewAppealReviewCompleted = 'item_review_appeal_review_completed',
  ItemReviewAppealReviewActionTaken = 'item_review_appeal_review_action_taken',
  ItemRemoved = 'item_removed',
  ItemRestored = 'item_restored',
  UserReviewOpened = 'user_review_opened',
  UserWarningIssued = 'user_warning_issued'
}

interface ActivityItem {
  id: string;
  type: ActivityItemType;
  occurredAt: Date;
  details: Record<string, unknown>;
}

export function ItemActivityTable({ itemId }: { itemId: string }) {
  const itemReviewService = useRef(createClientService(ItemReviewService)).current;
  const extendedItemService = useRef(createClientService(ExtendedItemService)).current;
  const falseTakingService = useRef(createClientService(FalseTakingService)).current;
  const itemReportService = useRef(createClientService(ItemReportService)).current;

  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [item, falseTakings, itemReports, relatedItemReviews] = await Promise.all([
        extendedItemService.getById(itemId),
        falseTakingService.getAll({ column: 'itemId', operator: 'eq', value: itemId }),
        itemReportService.getAll({ column: 'itemId', operator: 'eq', value: itemId }),
        itemReviewService.getAll([{ column: 'itemId', operator: 'eq', value: itemId }])
      ]);

      // Construct activity items
      const activities: ActivityItem[] = [];
      activities.push({
        id: item.id,
        type: ActivityItemType.ItemPosted,
        occurredAt: toDate(item.createdAt),
        details: {}
      });
      if (item.taken && item.takenAt && item.takenBy) {
        activities.push({
          id: item.id,
          type: ActivityItemType.ItemTaken,
          occurredAt: toDate(item.takenAt),
          details: { takerId: item.takenBy }
        });
        if (item.confirmedTakenAt) {
          activities.push({
            id: item.id,
            type: ActivityItemType.ItemConfirmedTaken,
            occurredAt: toDate(item.confirmedTakenAt),
            details: { takerId: item.takenBy }
          });
        }
      }
      itemReports.forEach((rep) => {
        activities.push({
          id: rep.id,
          type: ActivityItemType.ItemReported,
          occurredAt: toDate(rep.createdAt),
          details: { reporterId: rep.reporterId, reason: rep.reason }
        });
      });
      relatedItemReviews.forEach((r) => {
        activities.push({
          id: r.id,
          type: ActivityItemType.ItemReviewOpened,
          occurredAt: toDate(r.createdAt),
          details: { reason: r.triggerReason, triggerData: r.triggerData }
        });
        if (r.reviewStartedAt) {
          activities.push({
            id: r.id,
            type: ActivityItemType.ItemReviewStarted,
            occurredAt: toDate(r.reviewStartedAt),
            details: {}
          });
          if (r.reviewOutcomeActionTakenAt) {
            activities.push({
              id: r.id,
              type: ActivityItemType.ItemReviewActionTaken,
              occurredAt: toDate(r.reviewOutcomeActionTakenAt),
              details: {}
            });
            if (r.reviewOutcomeAction === ItemReviewOutcomeAction.ItemRemoved) {
              activities.push({
                id: r.id,
                type: ActivityItemType.ItemRemoved,
                occurredAt: toDate(r.reviewOutcomeActionTakenAt),
                details: {}
              });
            }
            if (r.reviewOutcomeAction === ItemReviewOutcomeAction.ItemRestored) {
              activities.push({
                id: r.id,
                type: ActivityItemType.ItemRestored,
                occurredAt: toDate(r.reviewOutcomeActionTakenAt),
                details: {}
              });
            }
          }
          if (r.reviewCompletedAt) {
            activities.push({
              id: r.id,
              type: ActivityItemType.ItemReviewCompleted,
              occurredAt: toDate(r.reviewCompletedAt),
              details: {}
            });

            // Appeal activities
            if (r.appealable && r.appealedAt) {
              activities.push({
                id: r.id,
                type: ActivityItemType.ItemReviewAppealed,
                occurredAt: toDate(r.appealedAt),
                details: {}
              });
              if (r.appealReviewStartedAt) {
                activities.push({
                  id: r.id,
                  type: ActivityItemType.ItemReviewAppealReviewStarted,
                  occurredAt: toDate(r.appealReviewStartedAt),
                  details: {}
                });
                if (r.appealReviewOutcomeActionTakenAt) {
                  activities.push({
                    id: r.id,
                    type: ActivityItemType.ItemReviewAppealReviewActionTaken,
                    occurredAt: toDate(r.appealReviewOutcomeActionTakenAt),
                    details: {}
                  });
                  if (r.appealReviewOutcomeAction === ItemReviewAppealReviewOutcomeAction.ItemRemovalReversed) {
                    activities.push({
                      id: r.id,
                      type: ActivityItemType.ItemRestored,
                      occurredAt: toDate(r.appealReviewOutcomeActionTakenAt),
                      details: {}
                    });
                  }
                }
                if (r.appealReviewCompletedAt) {
                  activities.push({
                    id: r.id,
                    type: ActivityItemType.ItemReviewAppealReviewCompleted,
                    occurredAt: toDate(r.appealReviewCompletedAt),
                    details: {}
                  });
                }
              }
            }
          }
        }
      });
      falseTakings.forEach((ft) => {
        activities.push({
          id: ft.id,
          type: ActivityItemType.ItemTakingConfirmedFalse,
          occurredAt: toDate(ft.restoredAt),
          details: { takerId: ft.takerId }
        });
      });
      setActivityItems(activities.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()));
    } catch (error) {
      logger.error('Failed to load review data', error);
      setError('Failed to load review details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [itemReportService, itemId, itemReviewService, extendedItemService, falseTakingService]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    // Show skeleton rows for loading state
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-row gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-64 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mb-2" />
        <div className="text-destructive font-semibold mb-2">Failed to load activity log</div>
        <div className="text-muted-foreground mb-4">{error}</div>
        <button
          className="px-4 py-2 rounded bg-muted text-foreground border border-input hover:bg-accent"
          onClick={refresh}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <DataTable
      columns={[
        {
          accessorKey: 'occurredAt',
          header: 'Date',
          cell: ({ row }: { row: Row<ActivityItem> }) => (
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              {formatDateTime(row.original.occurredAt)}
            </span>
          ),
          meta: { truncate: false }
        },
        {
          accessorKey: 'type',
          header: 'Type',
          cell: ({ row }: { row: Row<ActivityItem> }) => {
            const type = String(row.original.type);
            const typeMap: Record<string, { label: string; icon: React.ReactNode }> = {
              item_posted: {
                label: 'Item Posted',
                icon: <Package className="w-4 h-4 mr-1 text-blue-500" />
              },
              item_taken: {
                label: 'Item Taken',
                icon: <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
              },
              item_confirmed_taken: {
                label: 'Confirmed Taken',
                icon: <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
              },
              item_taking_confirmed_false: {
                label: 'False Taking',
                icon: <XCircle className="w-4 h-4 mr-1 text-red-500" />
              },
              item_reported: {
                label: 'Reported',
                icon: <Flag className="w-4 h-4 mr-1 text-yellow-500" />
              },
              item_review_opened: {
                label: 'Review Opened',
                icon: <Shield className="w-4 h-4 mr-1 text-blue-500" />
              },
              item_review_decision: {
                label: 'Review Closed',
                icon: <Shield className="w-4 h-4 mr-1 text-green-500" />
              },
              item_review_decision_appealed: {
                label: 'Appeal Submitted',
                icon: <AlertCircle className="w-4 h-4 mr-1 text-orange-500" />
              },
              item_review_appeal_closed: {
                label: 'Appeal Closed',
                icon: <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
              },
              item_removed: {
                label: 'Item Removed',
                icon: <XCircle className="w-4 h-4 mr-1 text-red-500" />
              },
              item_restored: {
                label: 'Item Restored',
                icon: <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
              },
              user_review_opened: {
                label: 'User Review',
                icon: <User className="w-4 h-4 mr-1 text-blue-500" />
              },
              user_warning_issued: {
                label: 'User Warning',
                icon: <AlertCircle className="w-4 h-4 mr-1 text-yellow-500" />
              }
            };
            const mapped = typeMap[type] || { label: type.replace(/_/g, ' '), icon: null };
            return (
              <span className="flex items-center gap-1 text-xs">
                {mapped.icon}
                <span className="capitalize">{mapped.label}</span>
              </span>
            );
          },
          meta: { truncate: false }
        },
        {
          accessorKey: 'details',
          header: 'Details',
          cell: ({ row }: { row: Row<ActivityItem> }) => {
            const details = JSON.stringify(row.original.details, null, 2);
            const isLong = details.length > 120;
            return isLong ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <pre className="text-xs whitespace-pre-wrap break-all max-w-xs overflow-x-auto bg-muted/30 rounded p-2 cursor-pointer">
                    {details.slice(0, 120)}
                    {details.length > 120 ? '…' : ''}
                  </pre>
                </TooltipTrigger>
                <TooltipContent className="max-w-md">
                  <pre className="text-xs whitespace-pre-wrap break-all">{details}</pre>
                </TooltipContent>
              </Tooltip>
            ) : (
              <pre className="text-xs whitespace-pre-wrap break-all max-w-xs overflow-x-auto bg-muted/30 rounded p-2">
                {details}
              </pre>
            );
          },
          meta: { truncate: false }
        }
      ]}
      data={activityItems}
      height={320}
      enableReordering={false}
      enableSelection={false}
      enableColumnResizing={true}
      enableColumnReordering={false}
      enableAutoSizing={true}
      maxHeight={400}
    />
  );
}
