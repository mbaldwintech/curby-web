'use client';

import { CountCell } from '@core/components';
import { ItemService } from '@core/services';
import { useMemo } from 'react';

export const TakenItemCountCell = ({ userId }: { userId?: string | null }) => {
  const filters = useMemo(() => ({ column: 'takenBy' as const, operator: 'eq' as const, value: userId! }), [userId]);
  return <CountCell service={ItemService} id={userId} filters={filters} />;
};
