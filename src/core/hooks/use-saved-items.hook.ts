'use client';

import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AdminDispatch, AdminState } from '@store/admin-store';
import { fetchSavedItems } from '../slices';
import { ExtendedItem } from '../types';

interface SavedItemsResult {
  savedItems: ExtendedItem[];
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

export const useSavedItems = (): SavedItemsResult => {
  const dispatch = useDispatch<AdminDispatch>();
  const { savedItems, error, loading } = useSelector((state: AdminState) => state.savedItems);

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
