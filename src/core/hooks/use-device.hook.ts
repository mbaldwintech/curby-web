'use client';

import { useDispatch, useSelector } from 'react-redux';

import { AdminDispatch, AdminState } from '@store/admin-store';
import { useCallback } from 'react';
import { syncDevice } from '../slices';
import { Device } from '../types';

interface DeviceResult {
  device: Device | null;
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

export const useDevice = (): DeviceResult => {
  const dispatch = useDispatch<AdminDispatch>();
  const { device, error, loading } = useSelector((state: AdminState) => state.device);

  const refetch = useCallback(() => {
    dispatch(syncDevice());
  }, [dispatch]);

  return {
    device,
    error,
    loading,
    refetch
  };
};
