import { cn } from '@common/utils';
import React from 'react';
import { AdminHeader, AdminHeaderProps } from './admin-header';

export interface AdminPageContainerProps extends React.PropsWithChildren {
  title: string;
  headerProps?: AdminHeaderProps;
}

export const AdminPageContainer = ({ title, headerProps, children }: AdminPageContainerProps) => {
  return (
    <>
      <AdminHeader {...headerProps} title={title ?? headerProps?.title} />
      <div
        className={cn(
          '@container/main',
          'flex flex-1 flex-col',
          'gap-2 sm:gap-2 md:gap-4 lg:gap6',
          'p-4 sm:p-4 md:p-6 lg:p-8'
        )}
      >
        {children}
      </div>
    </>
  );
};
