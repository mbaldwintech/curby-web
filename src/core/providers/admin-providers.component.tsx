'use client';

import { PortalQueueProvider } from '@common/providers';
import { authRoutes, AuthService, DeviceService } from '@core/services';
import { adminStore } from '@store/admin-store';
import { AuthProvider } from '@supa/providers';
import { createClientService } from '@supa/utils/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode, useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { ForceLogoutProvider } from './force-logout.provider';
import { PolicyGateProvider } from './policy-gate.provider';
import { ProfileProvider } from './profile.provider';

const queryClient = new QueryClient();

export interface AdminProvidersProps {
  onReady?: () => void;
  children: ReactNode;
}

export const AdminProviders: React.FC<AdminProvidersProps> = ({ onReady, children }) => {
  const authService = useRef(createClientService(AuthService)).current;
  const deviceService = useRef(createClientService(DeviceService)).current;
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const init = async () => {
      await deviceService.trackSeen();
      onReady?.();
    };

    init();
  }, [authService, deviceService, onReady]);

  return (
    <Provider store={adminStore}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider authService={authService} authRoutes={authRoutes} onReady={onReady}>
          <ProfileProvider>
            <ForceLogoutProvider>
              <PolicyGateProvider>
                <PortalQueueProvider>{children}</PortalQueueProvider>
              </PolicyGateProvider>
            </ForceLogoutProvider>
          </ProfileProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
};
