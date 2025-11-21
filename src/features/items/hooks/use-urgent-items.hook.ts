'use client';

import { ItemService } from '@core/services';
import { Item } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { useQuery } from '@tanstack/react-query';

interface UrgentItemsResult {
  urgentItems: Item[];
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

const itemService = createClientService(ItemService);

export const useUrgentItems = (): UrgentItemsResult => {
  const {
    data: urgentItems = [],
    error,
    isLoading: loading,
    refetch
  } = useQuery<Item[], Error>({
    queryKey: ['urgent-items'],
    queryFn: async () => {
      return await itemService.getMyUrgentItems();
    },
    refetchInterval: 10000, // 10 seconds
    staleTime: 10000
  });

  return {
    urgentItems,
    error: error ? error.message : null,
    loading,
    refetch
  };
};
