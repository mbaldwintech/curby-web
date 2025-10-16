import { LinkButton, SidebarInset, SidebarProvider } from '@common/components';
import { AdminSidebar, LogoHorizontal } from '@core/components';
import type { Metadata } from 'next';
import Link from 'next/link';
import { logout } from './actions';

export const metadata: Metadata = {
  title: 'Curby Admin',
  description: 'Curby Admin'
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)'
        } as React.CSSProperties
      }
    >
      <AdminSidebar logout={logout} />
      <SidebarInset>
        <div className="flex flex-1 flex-col">{children}</div>

        <footer id="contact" className="border-t-2 border-t-sidebar border-border">
          <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex flex-col items-start justify-start gap-2">
              <Link href="/">
                <LogoHorizontal className="h-10 w-auto mb-4" />
              </Link>
              <p className="text-sm text-secondary-foreground">
                Made with ❤️ for neighborhoods. Curby helps you keep good stuff in the community.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <LinkButton variant="link" href="mailto:hello@curby.app">
                hello@curby.app
              </LinkButton>
              <LinkButton variant="link" href="/legal/privacy">
                Privacy
              </LinkButton>
              <LinkButton variant="link" href="/legal/terms">
                Terms
              </LinkButton>
              <LinkButton variant="link" href="/admin">
                Admin
              </LinkButton>
            </div>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
