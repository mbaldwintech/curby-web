'use client';

import { useDispatch, useSelector } from 'react-redux';

import { AdminDispatch, AdminState } from '@store/admin-store';
import { useCallback } from 'react';
import { syncUserDevice } from '../slices';
import { UserDevice } from '../types';

interface UserDeviceResult {
  userDevice: UserDevice | null;
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

export const useUserDevice = (): UserDeviceResult => {
  const dispatch = useDispatch<AdminDispatch>();
  const { userDevice, error, loading } = useSelector((state: AdminState) => state.userDevice);

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
