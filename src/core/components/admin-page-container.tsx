'use client';

import React from 'react';
import { cn } from '../utils';
import { AdminHeader, AdminHeaderProps } from './admin-header';
import { Button, LoadingSpinner } from './base';

export interface AdminPageContainerProps extends React.PropsWithChildren {
  title: string;
  loading?: boolean;
  error?: string | null;
  retry?: () => void;
  headerProps?: AdminHeaderProps;
  containerClassName?: string;
}

export const AdminPageContainer = ({
  title,
  loading,
  error,
  retry,
  headerProps,
  containerClassName,
  children
}: AdminPageContainerProps) => {
  return (
    <>
      <AdminHeader {...headerProps} title={title ?? headerProps?.title} />
      <div
        className={cn(
          '@container/main',
          'flex flex-1 flex-col',
          'gap-2 sm:gap-2 md:gap-4 lg:gap6',
          'p-4 sm:p-4 md:p-6 lg:p-8',
          containerClassName
        )}
      >
        {loading ? (
          <div className="flex flex-1 items-center justify-center min-h-[200px]">
            <LoadingSpinner size={100} loading={loading} />
          </div>
        ) : error ? (
          <div className="flex flex-1 flex-col items-center justify-center min-h-[200px]">
            <div className="text-destructive font-semibold text-lg mb-2">{error}</div>
            {retry && (
              <Button variant="destructive" onClick={retry}>
                Retry
              </Button>
            )}
          </div>
        ) : (
          children
        )}
      </div>
    </>
  );
};
