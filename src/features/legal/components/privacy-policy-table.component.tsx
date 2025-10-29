'use client';

import { buildColumnDef, CurbyTable, CurbyTableProps, CurbyTableRef, CustomColumnDef } from '@core/components';
import { PrivacyPolicyService } from '@core/services';
import { PrivacyPolicy } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';

export interface PrivacyPolicyTableProps extends Omit<CurbyTableProps<PrivacyPolicy>, 'service' | 'columns'> {
  extraColumns?: CustomColumnDef<PrivacyPolicy>[];
}

export const PrivacyPolicyTable = forwardRef<CurbyTableRef<PrivacyPolicy>, PrivacyPolicyTableProps>(
  function PrivacyPolicyTable(props: PrivacyPolicyTableProps, ref) {
    const { extraColumns = [], ...rest } = props;
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

    return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
  }
);
