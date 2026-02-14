import { LinkButton, LogoHorizontal } from '@core/components';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { StickyHeader } from './sticky-header';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StickyHeader />
      {children}

      <footer id="contact" className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="md:col-span-2 space-y-4">
              <Link href="/">
                <LogoHorizontal className="h-12 w-auto" />
              </Link>
              <p className="text-sm text-muted-foreground max-w-md">
                Built with ❤️ to reduce waste and strengthen communities.
              </p>
              <a
                href="https://ko-fi.com/noahjamessmith"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <Heart className="h-4 w-4 fill-current" />
                Support Curby on Ko-fi
              </a>
              <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Curby. All rights reserved.</p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider">Product</h3>
              <nav className="flex flex-col gap-2">
                <LinkButton variant="link" href="#features" className="justify-start p-0 h-auto text-muted-foreground">
                  Features
                </LinkButton>
                <LinkButton
                  variant="link"
                  href="#how-it-works"
                  className="justify-start p-0 h-auto text-muted-foreground"
                >
                  How it Works
                </LinkButton>
                <LinkButton variant="link" href="/app" className="justify-start p-0 h-auto text-muted-foreground">
                  Get the App
                </LinkButton>
                <LinkButton
                  variant="link"
                  href="#support-us"
                  className="justify-start p-0 h-auto text-muted-foreground"
                >
                  Support Us
                </LinkButton>
              </nav>
            </div>

            {/* Legal & Contact */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider">Company</h3>
              <nav className="flex flex-col gap-2">
                <LinkButton
                  variant="link"
                  href="mailto:support@getcurby.app"
                  className="justify-start p-0 h-auto text-muted-foreground"
                >
                  Contact Us
                </LinkButton>
                <LinkButton
                  variant="link"
                  href="/legal/privacy"
                  className="justify-start p-0 h-auto text-muted-foreground"
                >
                  Privacy Policy
                </LinkButton>
                <LinkButton
                  variant="link"
                  href="/legal/terms"
                  className="justify-start p-0 h-auto text-muted-foreground"
                >
                  Terms of Service
                </LinkButton>
                <LinkButton variant="link" href="/admin" className="justify-start p-0 h-auto text-muted-foreground">
                  Admin
                </LinkButton>
              </nav>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
