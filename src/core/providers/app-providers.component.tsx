'use client';

import { Toaster } from '@common/components';
import { rootStore } from '@store/root-store';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import React from 'react';
import { Provider } from 'react-redux';
import { ConfirmDialogProvider } from '../hooks/use-confirm-dialog.hook';

export const AppProviders: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <Provider store={rootStore}>
        <ConfirmDialogProvider>
          {children}
          <Toaster />
        </ConfirmDialogProvider>
      </Provider>
    </NextThemesProvider>
  );
};
