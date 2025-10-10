import { Separator } from '@core/components/separator';
import { SidebarTrigger } from '@core/components/sidebar';
import { ThemeToggle } from './theme-toggle';

export function AdminHeader({ title, rightContent }: { title?: string; rightContent?: React.ReactNode }) {
  return (
    <header className="flex shrink-0 items-center border-b-2 border-b-sidebar transition-[width,height] ease-linear">
      <div className="flex w-full h-full items-center px-4 py-2 lg:px-6">
        <div className="h-full flex items-center gap-4 lg:gap-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" />
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
