'use client';

import { BackButton } from './back-button';
import { Separator, SidebarTrigger } from './base';
import { ThemeToggle } from './theme-toggle';

export interface AdminHeaderProps {
  title?: string;
  rightContent?: React.ReactNode;
}

export function AdminHeader({ title, rightContent }: AdminHeaderProps) {
  return (
    <header className="flex shrink-0 items-center border-b-2 border-b-sidebar transition-[width,height] ease-linear">
      <div className="flex w-full h-full items-center px-4 py-2 lg:px-6">
        <div className="h-full flex items-center gap-2 lg:gap-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" />
          {typeof window !== 'undefined' && window.history.length > 1 && (
            <>
              <BackButton />
              <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" />
            </>
          )}
          <h1 className="text-base font-medium">{title}</h1>
        </div>
        <div className="h-full flex flex-1 justify-end items-center gap-2 lg:gap-4">
          {rightContent && rightContent}
          <ThemeToggle className="size-7" />
        </div>
      </div>
    </header>
  );
}
