'use client';

import { useDispatch, useSelector } from 'react-redux';

import { AdminDispatch, AdminState } from '@store/admin-store';
import { useCallback, useEffect } from 'react';
import { fetchUrgentItemsCount } from '../slices';

interface UrgentItemsCountResult {
  count: number;
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

export const useUrgentItemsCount = (): UrgentItemsCountResult => {
  const dispatch = useDispatch<AdminDispatch>();
  const { count, error, loading } = useSelector((state: AdminState) => state.urgentItems);

  const refetch = useCallback(() => {
    dispatch(fetchUrgentItemsCount());
  }, [dispatch]);

  useEffect(() => {
    refetch();
    const interval = setInterval(() => {
      refetch();
    }, 10 * 1000);

    return () => clearInterval(interval);
  }, [refetch]);

  return {
    count,
    error,
    loading,
    refetch
  };
};
