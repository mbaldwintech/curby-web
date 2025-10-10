'use client';

import { Toaster } from '@core/components';
import { ConfirmDialogProvider } from '@core/hooks/use-confirm-dialog.hook';
import { rootStore } from '@store/root-store';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import React from 'react';
import { Provider } from 'react-redux';

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
