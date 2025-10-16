'use client';

import { CustomColumnDef } from '@common/components';
import { Filters } from '@supa/services';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { PrivacyPolicyService } from '../../services';
import { PrivacyPolicy } from '../../types';
import { buildColumnDef, CurbyTable, CurbyTableRef, CurbyTableRowAction } from '../curby-table';

export interface PrivacyPolicyTableProps {
  defaultFilters?: Filters<PrivacyPolicy>;
  onRowClick?: (privacyPolicy: PrivacyPolicy) => void;
  rowActionSections?: CurbyTableRowAction<PrivacyPolicy>[][];
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  height?: number;
  maxHeight?: number;
  extraColumns?: CustomColumnDef<PrivacyPolicy>[];
}

export const PrivacyPolicyTable = forwardRef<CurbyTableRef<PrivacyPolicy>, PrivacyPolicyTableProps>(
  function PrivacyPolicyTable(
    {
      defaultFilters,
      onRowClick,
      rowActionSections,
      toolbarLeft,
      toolbarRight,
      height = 500,
      maxHeight,
      extraColumns = []
    }: PrivacyPolicyTableProps,
    ref
  ) {
    const service = useRef(createClientService(PrivacyPolicyService)).current;

    const buildColumn = useCallback(
      <K extends keyof PrivacyPolicy>(
        key: K,
        header: string,
        options?: Partial<CustomColumnDef<PrivacyPolicy, PrivacyPolicy[K]>>
      ) => {
        return buildColumnDef<PrivacyPolicy, K>(key, header, service, options);
      },
      [service]
    );

    const columns: CustomColumnDef<PrivacyPolicy>[] = useMemo(
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
