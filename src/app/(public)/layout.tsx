import { LinkButton, LogoHorizontal, ThemeToggle } from '@core/components';
import Link from 'next/link';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4">
          <LogoHorizontal className="h12 w-auto" />
        </Link>

        <nav className="flex items-center gap-4">
          <LinkButton href="#features" variant="link">
            Features
          </LinkButton>
          <LinkButton href="#pricing" variant="link">
            Pricing
          </LinkButton>
          <LinkButton href="#contact" variant="link">
            Contact
          </LinkButton>

          <ThemeToggle />

          <LinkButton href="/app" variant="default">
            Get Curby
          </LinkButton>
        </nav>
      </header>
      {children}

      <footer id="contact" className="mt-16 border-t border-border bg-background">
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
    </>
  );
}
