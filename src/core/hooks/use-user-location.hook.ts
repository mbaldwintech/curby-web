'use client';

import { Coordinates } from '@common/types';
import { RootDispatch, RootState } from '@store/root-store';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearLocation, setError, setLoading, setUserLocation } from '../slices';

interface UserLocationResult {
  userLocation: Coordinates | null;
  error: string | null;
  permissionStatus: 'granted' | 'denied' | 'prompt' | null;
  loading: boolean;
  requestLocation: () => void;
  clearLocation: () => void;
}

export const useUserLocation = (): UserLocationResult => {
  const dispatch = useDispatch<RootDispatch>();
  const { userLocation, error, permissionStatus, loading } = useSelector((state: RootState) => state.userLocation);

  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      dispatch(setError('Geolocation not supported'));
      return;
    }

    dispatch(setLoading(true));

    let permission: 'granted' | 'denied' | 'prompt' = 'prompt';
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((status) => {
          permission = status.state as 'granted' | 'denied' | 'prompt';
        })
        .catch(() => {});
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        dispatch(
          setUserLocation({
            coords: [position.coords.latitude, position.coords.longitude],
            permissionStatus: permission
          })
        );
      },
      (err) => {
        dispatch(setError('Unable to fetch location'));
        console.error(err);
      },
      { enableHighAccuracy: true }
    );
  }, [dispatch]);

  const clearUserLocation = useCallback(() => {
    dispatch(clearLocation());
  }, [dispatch]);

  useEffect(() => {
    if (!userLocation) {
      requestLocation();
    }
  }, [userLocation, requestLocation]);

  return {
    userLocation,
    error,
    permissionStatus,
    loading,
    requestLocation,
    clearLocation: clearUserLocation
  };
};
