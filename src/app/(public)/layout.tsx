'use client';

import { LinkButton, LogoHorizontal, ThemeToggle } from '@core/components';
import { cn } from '@core/utils';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;

          // Use hysteresis to prevent infinite loops
          if (scrollY > 120 && !isScrolled) {
            setIsScrolled(true);
          } else if (scrollY < 40 && isScrolled) {
            setIsScrolled(false);
          }

          ticking = false;
        });

        ticking = true;
      }
    };

    // Set initial state
    if (window.scrollY > 120) {
      setIsScrolled(true);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300',
          isScrolled ? 'py-4 border-b border-border' : 'py-6 md:py-8'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4">
            <LogoHorizontal
              className={cn('w-auto transition-all duration-300', isScrolled ? 'h-10' : 'h-20 md:h-26')}
            />
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <LinkButton href="#features" variant="ghost" className="scroll-smooth">
              Features
            </LinkButton>
            <LinkButton href="#how-it-works" variant="ghost" className="scroll-smooth">
              How it works
            </LinkButton>
            <LinkButton href="#support-us" variant="ghost" className="scroll-smooth">
              Support Us
            </LinkButton>
            <LinkButton href="#contact" variant="ghost" className="scroll-smooth">
              Contact
            </LinkButton>

            <div className="ml-2">
              <ThemeToggle />
            </div>

            <LinkButton href="/app" variant="default" className="ml-2">
              Get Curby
            </LinkButton>
          </nav>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <LinkButton href="/app" variant="default" size="sm">
              Get Curby
            </LinkButton>
          </div>
        </div>
      </header>
      {children}

      <footer id="contact" className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="md:col-span-2 space-y-4">
              <Link href="/">
                <LogoHorizontal className="h-12 w-auto" />
              </Link>
              <p className="text-sm text-muted-foreground max-w-md">
                The simplest way to share and discover free stuff in your neighborhood. Built with ❤️ to reduce waste
                and strengthen communities.
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
                  href="mailto:hello@curby.app"
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

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Curby. All rights reserved.</p>
            <p className="text-sm text-muted-foreground">Made with 💚 for sustainable neighborhoods</p>
          </div>
        </div>
      </footer>
    </>
  );
}
