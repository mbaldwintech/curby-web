'use client';

import { ItemService } from '@core/services';
import { Item } from '@core/types';
import { createClientService } from '@supa/utils/client';
import { useQuery } from '@tanstack/react-query';

interface SavedItemsResult {
  savedItems: Item[];
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

const itemService = createClientService(ItemService);

export const useSavedItems = (): SavedItemsResult => {
  const {
    data: savedItems = [],
    error,
    isLoading: loading,
    refetch
  } = useQuery<Item[], Error>({
    queryKey: ['saved-items'],
    queryFn: async () => {
      return await itemService.getMySavedItems();
    },
    refetchInterval: 10000, // 10 seconds
    staleTime: 10000
  });

  return {
    savedItems,
    error: error ? error.message : null,
    loading,
    refetch
  };
};
