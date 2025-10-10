'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { useCallback } from 'react';
import { Button } from './button';

export function ThemeToggle({ className }: React.ComponentProps<'button'>) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} className={className}>
      <Sun className="h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:-rotate-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:rotate-90" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
