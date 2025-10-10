'use client';

import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AdminDispatch, AdminState } from '@store/admin-store';
import { fetchUrgentItems } from '../slices';
import { ExtendedItem } from '../types';

interface UrgentItemsResult {
  urgentItems: ExtendedItem[];
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

export const useUrgentItems = (): UrgentItemsResult => {
  const dispatch = useDispatch<AdminDispatch>();
  const { urgentItems, error, loading } = useSelector((state: AdminState) => state.urgentItems);

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
