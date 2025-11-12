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

      <section className="max-w-md mx-auto mt-20 mb-12 px-2">
        <div className="rounded-2xl border border-border bg-muted/30 backdrop-blur-sm shadow-sm p-8 text-center flex flex-col items-center gap-4">
          <h3 className="text-xl font-semibold text-foreground">Love what we're building at Curby?</h3>
          <p className="text-sm text-secondary-foreground max-w-md">
            Help us keep Curby growing and supporting local neighborhoods ❤️
          </p>
          <a
            href="https://ko-fi.com/noahjamessmith"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors mt-2"
          >
            <img
              className=""
              height={20}
              width={20}
              src="https://storage.ko-fi.com/cdn/logomarkLogo.png"
              alt="Ko-fi Logo"
            ></img>
            Support Curby on Ko-fi
          </a>
        </div>
      </section>

      <footer id="contact" className="mt-16 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex flex-col items-start justify-start gap-2">
            <Link href="/">
              <LogoHorizontal className="h-10 w-auto mb-4" />
            </Link>
            <p className="text-sm text-secondary-foreground">
              Made with ❤️ for neighborhoods. Curby helps you keep good stuff in the community.
            </p>

            {/* TODO: Mike update with your link here... */}
            <a
              href="https://ko-fi.com/noahjamessmith"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center mt-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {/* Loving Curby? Buy us a coffee ☕ on Ko-fi ❤️ */}
              {/* Enjoying Curby? Support us on Ko-fi ❤️ */}
              Help keep Curby brewing ☕ — support us on Ko-fi ❤️
            </a>
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
