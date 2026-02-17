'use client';

import { CountCell } from '@core/components';
import { ItemReportService } from '@core/services';
import { useMemo } from 'react';

export const SubmittedReportsCountCell = ({ userId }: { userId?: string | null }) => {
  const filters = useMemo(() => ({ column: 'reporterId' as const, operator: 'eq' as const, value: userId! }), [userId]);
  return <CountCell service={ItemReportService} id={userId} filters={filters} />;
};
