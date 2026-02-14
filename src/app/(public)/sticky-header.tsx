'use client';

import { LinkButton, LogoHorizontal, ThemeToggle } from '@core/components';
import { cn } from '@core/utils';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function StickyHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;

          // Use hysteresis to prevent infinite loops
          if (scrollY > 130 && !isScrolled) {
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
    <header
      className={cn(
        'sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300',
        isScrolled ? 'py-4 border-b border-border' : 'py-6 md:py-8'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4">
          <LogoHorizontal className={cn('w-auto transition-all duration-300', isScrolled ? 'h-10' : 'h-20 md:h-26')} />
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
  );
}
