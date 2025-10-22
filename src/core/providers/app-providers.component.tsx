'use client';

import { appStore } from '@store/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import React from 'react';
import { Provider } from 'react-redux';
import { Toaster } from '../components';
import { ConfirmDialogProvider } from './confirm-dialog.provider';
import { PortalQueueProvider } from './portal-queue.provider';

const queryClient = new QueryClient();

export const AppProviders: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <Provider store={appStore}>
        <QueryClientProvider client={queryClient}>
          <ConfirmDialogProvider>
            <PortalQueueProvider>{children}</PortalQueueProvider>
            <Toaster />
          </ConfirmDialogProvider>
        </QueryClientProvider>
      </Provider>
    </NextThemesProvider>
  );
};
