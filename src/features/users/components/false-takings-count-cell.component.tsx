'use client';

import { CountCell } from '@core/components';
import { FalseTakingService } from '@core/services';
import { useMemo } from 'react';

export const FalseTakingsCountCell = ({ userId }: { userId?: string | null }) => {
  const filters = useMemo(() => ({ column: 'takerId' as const, operator: 'eq' as const, value: userId! }), [userId]);
  return <CountCell service={FalseTakingService} id={userId} filters={filters} />;
};
