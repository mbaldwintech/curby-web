'use client';

import { useDispatch, useSelector } from 'react-redux';

import { Device } from '@core/types';
import { AppDispatch, AppState } from '@store/store';
import { useCallback } from 'react';
import { syncDevice } from '../slices';

interface DeviceResult {
  device: Device | null;
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

export const useDevice = (): DeviceResult => {
  const dispatch = useDispatch<AppDispatch>();
  const { device, error, loading } = useSelector((state: AppState) => state.device);

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
