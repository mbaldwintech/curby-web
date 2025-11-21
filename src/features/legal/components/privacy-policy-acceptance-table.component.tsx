'use client';

import { buildColumnDef, CurbyTable, CurbyTableProps, CurbyTableRef, CustomColumnDef } from '@core/components';
import { PrivacyPolicyAcceptanceService } from '@core/services';
import { PrivacyPolicyAcceptance } from '@core/types';
import { ProfileCell } from '@features/users/components';
import { createClientService } from '@supa/utils/client';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { PrivacyPolicyCell } from './privacy-policy-cell.component';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PrivacyPolicyAcceptanceTableProps
  extends Omit<CurbyTableProps<PrivacyPolicyAcceptance>, 'service' | 'columns'> {}

export const PrivacyPolicyAcceptanceTable = forwardRef<
  CurbyTableRef<PrivacyPolicyAcceptance>,
  PrivacyPolicyAcceptanceTableProps
>(function PrivacyPolicyAcceptanceTable(props: PrivacyPolicyAcceptanceTableProps, ref) {
  const { ...rest } = props;
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
    () =>
      [
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
        })
      ].filter((c) => c !== undefined),
    [buildColumn]
  );

  return <CurbyTable ref={ref} service={service} columns={columns} {...rest} />;
});
