'use client';

import { buildColumnDef, CurbyTable, CurbyTableProps, CurbyTableRef, CustomColumnDef } from '@core/components';
import { TermsAndConditionsAcceptanceService } from '@core/services';
import { TermsAndConditionsAcceptance } from '@core/types';
import { ProfileCell } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { TermsAndConditionsCell } from './terms-and-conditions-cell.component';

export interface TermsAndConditionsAcceptanceTableProps
  extends Omit<CurbyTableProps<TermsAndConditionsAcceptance>, 'service' | 'columns'> {
  extraColumns?: CustomColumnDef<TermsAndConditionsAcceptance>[];
}

export const TermsAndConditionsAcceptanceTable = forwardRef<
  CurbyTableRef<TermsAndConditionsAcceptance>,
  TermsAndConditionsAcceptanceTableProps
>(function TermsAndConditionsAcceptanceTable(props: TermsAndConditionsAcceptanceTableProps, ref) {
  const { extraColumns = [], ...rest } = props;
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

  return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
});
