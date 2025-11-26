'use client';

import { buildColumnDef, CurbyTable, CurbyTableProps, CurbyTableRef, CustomColumnDef } from '@core/components';
import { BroadcastService } from '@core/services';
import { Broadcast } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { format } from 'date-fns';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { BroadcastAudienceBadge } from './broadcast-audience-badge.component';
import { BroadcastCategoryBadge } from './broadcast-category-badge.component';
import { BroadcastPlatformBadge } from './broadcast-platform-badge.component';
import { BroadcastStatusBadge } from './broadcast-status-badge.component';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BroadcastTableProps extends Omit<CurbyTableProps<Broadcast>, 'service' | 'columns'> {}

export const BroadcastTable = forwardRef<CurbyTableRef<Broadcast>, BroadcastTableProps>(function BroadcastTable(
  props: BroadcastTableProps,
  ref
) {
  const { ...rest } = props;
  const service = useRef(createClientService(BroadcastService)).current;

  const buildColumn = useCallback(
    <K extends keyof Broadcast>(
      key: K,
      header: string,
      options?: Partial<CustomColumnDef<Broadcast, Broadcast[K]>>
    ) => {
      return buildColumnDef<Broadcast, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<Broadcast>[] = useMemo(
    () =>
      [
        buildColumn('name', 'Name', { enableHiding: false }),
        buildColumn('title', 'Title'),
        buildColumn('category', 'Category', {
          cell: ({ row }) => <BroadcastCategoryBadge category={row.original.category} />
        }),
        buildColumn('status', 'Status', {
          cell: ({ row }) => <BroadcastStatusBadge status={row.original.status} />
        }),
        buildColumn('priority', 'Priority'),
        buildColumn('audience', 'Audience', {
          cell: ({ row }) => <BroadcastAudienceBadge audience={row.original.audience} />
        }),
        buildColumn('platform', 'Platform', {
          cell: ({ row }) => <BroadcastPlatformBadge platform={row.original.platform} />
        }),
        buildColumn('validFrom', 'Valid From', {
          cell: ({ row }) => format(new Date(row.original.validFrom), 'MMM d, yyyy HH:mm')
        }),
        buildColumn('validTo', 'Valid To', {
          cell: ({ row }) =>
            row.original.validTo ? format(new Date(row.original.validTo), 'MMM d, yyyy HH:mm') : 'Never'
        }),
        buildColumn('sendPush', 'Push', {
          cell: ({ row }) => (row.original.sendPush ? '✓' : '—')
        }),
        buildColumn('sendEmail', 'Email', {
          cell: ({ row }) => (row.original.sendEmail ? '✓' : '—')
        })
      ].filter((c) => c !== undefined),
    [buildColumn]
  );

  return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
});
