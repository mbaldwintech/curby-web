'use client';

import { CustomColumnDef } from '@common/components';
import { Filters } from '@supa/services';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { TermsAndConditionsService } from '../../services';
import { TermsAndConditions } from '../../types';
import { buildColumnDef, CurbyTable, CurbyTableRef, CurbyTableRowAction } from '../curby-table';

export interface TermsAndConditionsTableProps {
  defaultFilters?: Filters<TermsAndConditions>;
  onRowClick?: (termsAndConditions: TermsAndConditions) => void;
  rowActionSections?: CurbyTableRowAction<TermsAndConditions>[][];
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  height?: number;
  maxHeight?: number;
  extraColumns?: CustomColumnDef<TermsAndConditions>[];
}

export const TermsAndConditionsTable = forwardRef<CurbyTableRef<TermsAndConditions>, TermsAndConditionsTableProps>(
  function TermsAndConditionsTable(
    {
      defaultFilters,
      onRowClick,
      rowActionSections,
      toolbarLeft,
      toolbarRight,
      height = 500,
      maxHeight,
      extraColumns = []
    }: TermsAndConditionsTableProps,
    ref
  ) {
    const service = useRef(createClientService(TermsAndConditionsService)).current;

    const buildColumn = useCallback(
      <K extends keyof TermsAndConditions>(
        key: K,
        header: string,
        options?: Partial<CustomColumnDef<TermsAndConditions, TermsAndConditions[K]>>
      ) => {
        return buildColumnDef<TermsAndConditions, K>(key, header, service, options);
      },
      [service]
    );

    const columns: CustomColumnDef<TermsAndConditions>[] = useMemo(
      () => [
        buildColumn('version', 'Version'),
        buildColumn('effectiveDate', 'Effective Date', {
          cell: ({ row }) => <div>{new Date(row.original.effectiveDate).toLocaleDateString()}</div>
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
  }
);
