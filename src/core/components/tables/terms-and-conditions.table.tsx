'use client';

import { CustomColumnDef } from '@common/components';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { TermsAndConditionsService } from '../../services';
import { TermsAndConditions } from '../../types';
import { buildColumnDef, CurbyTable, CurbyTableProps, CurbyTableRef } from '../curby-table';

export interface TermsAndConditionsTableProps extends Omit<CurbyTableProps<TermsAndConditions>, 'service' | 'columns'> {
  extraColumns?: CustomColumnDef<TermsAndConditions>[];
}

export const TermsAndConditionsTable = forwardRef<CurbyTableRef<TermsAndConditions>, TermsAndConditionsTableProps>(
  function TermsAndConditionsTable(props: TermsAndConditionsTableProps, ref) {
    const { extraColumns = [], ...rest } = props;
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

    return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
  }
);
