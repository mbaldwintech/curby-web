'use client';

import { useDispatch, useSelector } from 'react-redux';

import { AdminDispatch, AdminState } from '@store/admin-store';
import { useCallback, useEffect } from 'react';
import { fetchCurbyCoinBalance } from '../slices';

interface CurbyCoinBalanceResult {
  balance: number;
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

export const useCurbyCoinBalance = (): CurbyCoinBalanceResult => {
  const dispatch = useDispatch<AdminDispatch>();
  const { balance, error, loading } = useSelector((state: AdminState) => state.curbyCoinBalance);

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
