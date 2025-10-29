'use client';

import { ProfileService } from '@core/services';
import { useAuth } from '@supa/providers';
import { createClientService } from '@supa/utils/client';
import { ReactNode, useEffect, useRef } from 'react';
import { useProfile } from '../hooks';

export interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const profileService = useRef(createClientService(ProfileService)).current;
  const { isAuthenticated } = useAuth();
  const { profile, refetch } = useProfile();

  useEffect(() => {
    if (isAuthenticated && !profile) {
      refetch();
    }
  }, [isAuthenticated, profile, refetch]);

  useEffect(() => {
    if (!profile) return;

    return profileService.subscribeToRowById(profile.id, () => {
      refetch();
    });
  }, [profile, refetch, profileService]);

  return children;
};
