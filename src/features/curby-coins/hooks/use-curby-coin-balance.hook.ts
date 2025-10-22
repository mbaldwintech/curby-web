'use client';

import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, AppState } from '@store/store';
import { useCallback, useEffect } from 'react';
import { fetchCurbyCoinBalance } from '../slices';

interface CurbyCoinBalanceResult {
  balance: number;
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

export const useCurbyCoinBalance = (): CurbyCoinBalanceResult => {
  const dispatch = useDispatch<AppDispatch>();
  const { balance, error, loading } = useSelector((state: AppState) => state.curbyCoinBalance);

  const refetch = useCallback(() => {
    dispatch(fetchCurbyCoinBalance());
  }, [dispatch]);

  useEffect(() => {
    refetch();
    const interval = setInterval(() => {
      refetch();
    }, 10 * 1000);

    return () => clearInterval(interval);
  }, [refetch]);

  return {
    balance,
    error,
    loading,
    refetch
  };
};
