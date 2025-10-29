'use client';

import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, AppState } from '@store/store';
import { useCallback, useEffect } from 'react';
import { clearNotificationCount, fetchNotificationCount } from '../slices';

interface NotificationCountResult {
  count: number;
  error: string | null;
  loading: boolean;
  refetch: () => void;
  clearCount: () => void;
}

export const useNotificationCount = (): NotificationCountResult => {
  const dispatch = useDispatch<AppDispatch>();
  const { count, error, loading } = useSelector((state: AppState) => state.notificationCount);

  const refetch = useCallback(() => {
    dispatch(fetchNotificationCount());
  }, [dispatch]);

  const clearCount = () => {
    dispatch(clearNotificationCount());
  };

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
    refetch,
    clearCount
  };
};
