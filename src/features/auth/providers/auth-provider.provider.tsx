'use client';

import { authRoutes, AuthService } from '@core/services';
import { AuthProvider as BaseAuthProvider } from '@supa/providers';
import { createClientService } from '@supa/utils/client';
import { useRef } from 'react';

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const authService = useRef(createClientService(AuthService)).current;

  return (
    <BaseAuthProvider authService={authService} authRoutes={authRoutes}>
      {children}
    </BaseAuthProvider>
  );
};
