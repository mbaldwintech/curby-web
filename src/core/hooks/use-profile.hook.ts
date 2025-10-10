'use client';

import { useDispatch, useSelector } from 'react-redux';

import { AdminDispatch, AdminState } from '@store/admin-store';
import { useCallback } from 'react';
import { syncProfile } from '../slices';
import { Profile } from '../types';

interface ProfileResult {
  profile: Profile | null;
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

export const useProfile = (): ProfileResult => {
  const dispatch = useDispatch<AdminDispatch>();
  const { profile, error, loading } = useSelector((state: AdminState) => state.profile);

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
