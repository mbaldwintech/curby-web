'use client';

import { useDispatch, useSelector } from 'react-redux';

import { UserDevice } from '@core/types';
import { AppDispatch, AppState } from '@store/store';
import { useCallback } from 'react';
import { syncUserDevice } from '../slices';

interface UserDeviceResult {
  userDevice: UserDevice | null;
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

export const useUserDevice = (): UserDeviceResult => {
  const dispatch = useDispatch<AppDispatch>();
  const { userDevice, error, loading } = useSelector((state: AppState) => state.userDevice);

  const refetch = useCallback(() => {
    dispatch(syncUserDevice());
  }, [dispatch]);

  return {
    userDevice,
    error,
    loading,
    refetch
  };
};
