'use client';

import {
  Badge,
  buildColumnDef,
  buildEnumFilterComponentOptions,
  CopyableStringCell,
  CurbyTable,
  CurbyTableProps,
  CurbyTableRef,
  CustomColumnDef,
  PagedAutocompleteFilterComponentOptions
} from '@core/components';
import { SupportRequestCategory, SupportRequestPriority, SupportRequestStatus, UserRole } from '@core/enumerations';
import { DeviceService, ProfileService, SupportRequestService } from '@core/services';
import { SupportRequest } from '@core/types';
import { DeviceCell } from '@features/devices/components';
import { ProfileCell } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { HeaderContext } from '@tanstack/react-table';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { CustomerSatisfactionInput } from './customer-satisfaction-input.component';
import { CustomerSatisfaction } from './customer-satisfaction.component';
import { SupportRequestCategoryBadge } from './support-request-category-badge.component';
import { SupportRequestPriorityBadge } from './support-request-priority-badge.component';
import { SupportRequestStatusBadge } from './support-request-status-badge.component';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SupportRequestTableProps extends Omit<CurbyTableProps<SupportRequest>, 'service' | 'columns'> {}

export const SupportRequestTable = forwardRef<CurbyTableRef<SupportRequest>, SupportRequestTableProps>(
  function SupportRequestTable(props: SupportRequestTableProps, ref) {
    const { ...rest } = props;
    const service = useRef(createClientService(SupportRequestService)).current;
    const profileService = useRef(createClientService(ProfileService)).current;
    const deviceService = useRef(createClientService(DeviceService)).current;

    const buildColumn = useCallback(
      <K extends keyof SupportRequest>(
        key: K,
        header: string,
        options?: Partial<CustomColumnDef<SupportRequest, SupportRequest[K]>>
      ) => {
        return buildColumnDef<SupportRequest, K>(key, header, service, options);
      },
      [service]
    );

    const columns: CustomColumnDef<SupportRequest>[] = useMemo(
      () =>
        [
          buildColumn('id', 'ID', {
            enableHiding: false,
            cell: ({ row }) => <CopyableStringCell value={row.original.id} />,
            size: 200
          }),
          buildColumn('userId', 'User', {
            cell: ({ row }) => <ProfileCell userId={row.original.userId} />,
            filterComponentOptions: {
              getCount: async (query: string) => {
                return profileService.count(undefined, { text: query, columns: ['userId'] });
              },
              fetchOptions: async (query: string, pageIndex: number, pageSize: number) => {
                const items = await profileService.getAllPaged(
                  undefined,
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
          buildColumn('deviceId', 'Device', {
            cell: ({ row }) => <DeviceCell deviceId={row.original.deviceId} />,
            filterComponentOptions: {
              getCount: async (query: string) => {
                return deviceService.count(undefined, { text: query, columns: ['id'] });
              },
              fetchOptions: async (query: string, pageIndex: number, pageSize: number) => {
                const items = await deviceService.getAllPaged(
                  undefined,
                  { column: 'id', ascending: true },
                  { pageIndex, pageSize },
                  { text: query, columns: ['id'] }
                );
                const res = items.reduce(
                  (acc, item) => {
                    if (!item.id || acc.some((i) => i.id === item.id)) {
                      return acc;
                    }
                    acc.push({ id: item.id, label: item.deviceId || item.id });
                    return acc;
                  },
                  [] as { id: string; label: string }[]
                );
                return res;
              },
              fetchSelectedItem: async (id: string) => {
                const res = await deviceService
                  .getOneOrNull([{ column: 'id', operator: 'eq', value: id }])
                  .then((item) => {
                    if (item && item.id) {
                      return { id: item.id, label: item.deviceId || item.id };
                    }
                    return null;
                  });
                return res;
              },
              nullable: true,
              nullValueLabel: 'Unassigned'
            } as PagedAutocompleteFilterComponentOptions
          }),
          buildColumn('subject', 'Subject'),
          buildColumn('message', 'Message'),
          buildColumn('category', 'Category', {
            cell: ({ row }) => <SupportRequestCategoryBadge category={row.original.category} />,
            filterComponentOptions: buildEnumFilterComponentOptions(SupportRequestCategory)
          }),
          buildColumn('priority', 'Priority', {
            cell: ({ row }) => <SupportRequestPriorityBadge priority={row.original.priority} />,
            filterComponentOptions: buildEnumFilterComponentOptions(SupportRequestPriority)
          }),
          buildColumn('status', 'Status', {
            cell: ({ row }) => <SupportRequestStatusBadge status={row.original.status} />,
            filterComponentOptions: buildEnumFilterComponentOptions(SupportRequestStatus)
          }),
          buildColumn('assignedTo', 'Assignee', {
            cell: ({ row }) => <ProfileCell userId={row.original.assignedTo} />,
            filterComponentOptions: {
              getCount: async (query: string) => {
                return profileService.count(undefined, { text: query, columns: ['userId'] });
              },
              fetchOptions: async (query: string, pageIndex: number, pageSize: number) => {
                const items = await profileService.getAllPaged(
                  [{ column: 'role', operator: 'in', value: [UserRole.Admin, UserRole.Support] }],
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
          buildColumn('assignedAt', 'Assigned At', {
            cell: ({ row }) => (row.original.assignedAt ? new Date(row.original.assignedAt).toLocaleString() : '')
          }),
          buildColumn('resolvedAt', 'Resolved At', {
            cell: ({ row }) => (row.original.resolvedAt ? new Date(row.original.resolvedAt).toLocaleString() : '')
          }),
          buildColumn('resolvedBy', 'Resolved By', {
            cell: ({ row }) => <ProfileCell userId={row.original.resolvedBy} />,
            filterComponentOptions: {
              getCount: async (query: string) => {
                return profileService.count(undefined, { text: query, columns: ['userId'] });
              },
              fetchOptions: async (query: string, pageIndex: number, pageSize: number) => {
                const items = await profileService.getAllPaged(
                  undefined,
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
          buildColumn('resolutionNotes', 'Resolution Notes'),
          buildColumn('customerSatisfaction', 'Customer Satisfaction', {
            cell: ({ row }) => <CustomerSatisfaction rating={row.original.customerSatisfaction} />,
            filterComponent: (header: HeaderContext<SupportRequest, SupportRequest['customerSatisfaction']>) => (
              <CustomerSatisfactionInput
                rating={(header.column.getFilterValue() as SupportRequest['customerSatisfaction']) || null}
                onChange={(val) => header.column.setFilterValue(val)}
                showClearButton={true}
              />
            )
          }),
          buildColumn('customerFeedback', 'Customer Feedback'),
          buildColumn('appVersion', 'App Version'),
          buildColumn('userAgent', 'User Agent'),
          buildColumn('escalatedAt', 'Escalated At', {
            cell: ({ row }) => (row.original.escalatedAt ? new Date(row.original.escalatedAt).toLocaleString() : '')
          }),
          buildColumn('escalationReason', 'Escalation Reason'),
          buildColumn('slaBreached', 'SLA Breached', {
            cell: ({ row }) =>
              row.original.slaBreached ? <Badge color="red">Yes</Badge> : <Badge color="green">No</Badge>
          }),
          buildColumn('dueDate', 'Due Date', {
            cell: ({ row }) => (row.original.dueDate ? new Date(row.original.dueDate).toLocaleDateString() : '')
          }),
          buildColumn('tags', 'Tags', {
            cell: ({ row }) => row.original.tags.join(', ')
          })
        ].filter((c) => c !== undefined),
      [buildColumn, deviceService, profileService]
    );

    return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
  }
);
