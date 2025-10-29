'use client';

import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ExtendedItem } from '@core/types';
import { AppDispatch, AppState } from '@store/store';
import { fetchUrgentItems } from '../slices';

interface UrgentItemsResult {
  urgentItems: ExtendedItem[];
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

export const useUrgentItems = (): UrgentItemsResult => {
  const dispatch = useDispatch<AppDispatch>();
  const { urgentItems, error, loading } = useSelector((state: AppState) => state.urgentItems);

  const refetch = useCallback(() => {
    dispatch(fetchUrgentItems());
  }, [dispatch]);

  useEffect(() => {
    refetch();
    const interval = setInterval(() => {
      refetch();
    }, 10 * 1000);

    return () => clearInterval(interval);
  }, [refetch]);

  return {
    urgentItems,
    error,
    loading,
    refetch
  };
};
