'use client';

import { CustomColumnDef } from '@common/components';
import { Filters } from '@supa/services';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { TermsAndConditionsAcceptanceService } from '../../services';
import { TermsAndConditionsAcceptance } from '../../types';
import { ProfileCell, TermsAndConditionsCell } from '../cells';
import { buildColumnDef, CurbyTable, CurbyTableRef, CurbyTableRowAction } from '../curby-table';

export interface TermsAndConditionsAcceptanceTableProps {
  defaultFilters?: Filters<TermsAndConditionsAcceptance>;
  onRowClick?: (termsAndConditionsAcceptance: TermsAndConditionsAcceptance) => void;
  rowActionSections?: CurbyTableRowAction<TermsAndConditionsAcceptance>[][];
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  height?: number;
  maxHeight?: number;
  extraColumns?: CustomColumnDef<TermsAndConditionsAcceptance>[];
}

export const TermsAndConditionsAcceptanceTable = forwardRef<
  CurbyTableRef<TermsAndConditionsAcceptance>,
  TermsAndConditionsAcceptanceTableProps
>(function TermsAndConditionsAcceptanceTable(
  {
    defaultFilters,
    onRowClick,
    rowActionSections,
    toolbarLeft,
    toolbarRight,
    height = 500,
    maxHeight,
    extraColumns = []
  }: TermsAndConditionsAcceptanceTableProps,
  ref
) {
  const service = useRef(createClientService(TermsAndConditionsAcceptanceService)).current;

  const buildColumn = useCallback(
    <K extends keyof TermsAndConditionsAcceptance>(
      key: K,
      header: string,
      options?: Partial<CustomColumnDef<TermsAndConditionsAcceptance, TermsAndConditionsAcceptance[K]>>
    ) => {
      return buildColumnDef<TermsAndConditionsAcceptance, K>(key, header, service, options);
    },
    [service]
  );

  const columns: CustomColumnDef<TermsAndConditionsAcceptance>[] = useMemo(
    () => [
      buildColumn('termsAndConditionsId', 'Privacy Policy', {
        cell: ({ row }) => <TermsAndConditionsCell termsAndConditionsId={row.original.termsAndConditionsId} />
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
