'use client';

import { CountCell } from '@core/components';
import { SavedItemService } from '@core/services';
import { useMemo } from 'react';

export const SavedItemCountCell = ({ userId }: { userId?: string | null }) => {
  const filters = useMemo(() => ({ column: 'userId' as const, operator: 'eq' as const, value: userId! }), [userId]);
  return <CountCell service={SavedItemService} id={userId} filters={filters} />;
};
