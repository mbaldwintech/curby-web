'use client';

import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ExtendedItem } from '@core/types';
import { AppDispatch, AppState } from '@store/store';
import { fetchSavedItems } from '../slices';

interface SavedItemsResult {
  savedItems: ExtendedItem[];
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

export const useSavedItems = (): SavedItemsResult => {
  const dispatch = useDispatch<AppDispatch>();
  const { savedItems, error, loading } = useSelector((state: AppState) => state.savedItems);

  const refetch = useCallback(() => {
    dispatch(fetchSavedItems());
  }, [dispatch]);

  useEffect(() => {
    refetch();
    const interval = setInterval(() => {
      refetch();
    }, 10 * 1000);

    return () => clearInterval(interval);
  }, [refetch]);

  return {
    savedItems,
    error,
    loading,
    refetch
  };
};
