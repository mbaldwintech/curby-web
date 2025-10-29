'use client';

import { useDispatch, useSelector } from 'react-redux';

import { Profile } from '@core/types';
import { AppDispatch, AppState } from '@store/store';
import { useCallback } from 'react';
import { syncProfile } from '../slices';

interface ProfileResult {
  profile: Profile | null;
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

export const useProfile = (): ProfileResult => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, error, loading } = useSelector((state: AppState) => state.profile);

  const refetch = useCallback(() => {
    dispatch(syncProfile());
  }, [dispatch]);

  return {
    profile,
    error,
    loading,
    refetch
  };
};
