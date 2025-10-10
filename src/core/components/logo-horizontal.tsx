'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export const LogoHorizontal = ({ className }: { className?: string }) => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // You could return a placeholder or null until theme is known
    return (
      <Image
        src="/Curby-Logo-Horizontal-Light.png"
        alt="Curby Logo"
        width={180}
        height={38}
        priority
        className={className}
      />
    );
  }

  return (
    <Image
      src={(theme ?? resolvedTheme) === 'light' ? '/Curby-Logo-Horizontal.png' : '/Curby-Logo-Horizontal-Light.png'}
      alt="Curby Logo"
      width={180}
      height={38}
      priority
      className={className}
    />
  );
};
