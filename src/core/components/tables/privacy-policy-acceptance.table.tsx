'use client';

import { CustomColumnDef } from '@common/components';
import { Filters } from '@supa/services';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { PrivacyPolicyAcceptanceService } from '../../services';
import { PrivacyPolicyAcceptance } from '../../types';
import { PrivacyPolicyCell, ProfileCell } from '../cells';
import { buildColumnDef, CurbyTable, CurbyTableRef, CurbyTableRowAction } from '../curby-table';

export interface PrivacyPolicyAcceptanceTableProps {
  defaultFilters?: Filters<PrivacyPolicyAcceptance>;
  onRowClick?: (privacyPolicyAcceptance: PrivacyPolicyAcceptance) => void;
  rowActionSections?: CurbyTableRowAction<PrivacyPolicyAcceptance>[][];
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  height?: number;
  maxHeight?: number;
  extraColumns?: CustomColumnDef<PrivacyPolicyAcceptance>[];
}

export const PrivacyPolicyAcceptanceTable = forwardRef<
  CurbyTableRef<PrivacyPolicyAcceptance>,
  PrivacyPolicyAcceptanceTableProps
>(function PrivacyPolicyAcceptanceTable(
  {
    defaultFilters,
    onRowClick,
    rowActionSections,
    toolbarLeft,
    toolbarRight,
    height = 500,
    maxHeight,
    extraColumns = []
  }: PrivacyPolicyAcceptanceTableProps,
  ref
) {
  const service = useRef(createClientService(PrivacyPolicyAcceptanceService)).current;

  const buildColumn = useCallback(
    <K extends keyof PrivacyPolicyAcceptance>(
      key: K,
      header: string,
      options?: Partial<CustomColumnDef<PrivacyPolicyAcceptance, PrivacyPolicyAcceptance[K]>>
    ) => {
      return buildColumnDef<PrivacyPolicyAcceptance, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<PrivacyPolicyAcceptance>[] = useMemo(
    () => [
      buildColumn('privacyPolicyId', 'Privacy Policy', {
        cell: ({ row }) => <PrivacyPolicyCell privacyPolicyId={row.original.privacyPolicyId} />
      }),
      buildColumn('userId', 'User', {
        enableHiding: false,
        cell: ({ row }) => <ProfileCell userId={row.original.userId} />
      }),
      buildColumn('acceptedAt', 'Accepted At', {
        cell: ({ row }) => new Date(row.original.acceptedAt).toLocaleString(),
        sortingFn: 'datetime',
        enableHiding: false
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
