'use client';

import { CountCell } from '@core/components';
import { ItemService } from '@core/services';
import { useMemo } from 'react';

export const PostedItemCountCell = ({ userId }: { userId?: string | null }) => {
  const filters = useMemo(() => ({ column: 'postedBy' as const, operator: 'eq' as const, value: userId! }), [userId]);
  return <CountCell service={ItemService} id={userId} filters={filters} />;
};
