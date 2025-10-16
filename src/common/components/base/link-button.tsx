import { cva } from 'class-variance-authority';
import * as React from 'react';

import Link, { LinkProps } from 'next/link';
import { cn } from '../../utils';

const linkButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-primary hover:text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-md px-6',
        icon: 'h-9 w-9'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface LinkButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LinkPropsType = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps<any>> &
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  LinkProps<any> & { children?: React.ReactNode | undefined } & React.RefAttributes<HTMLAnchorElement>;

const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps & LinkPropsType>(
  ({ className, variant, size, ...props }, ref) => {
    return <Link className={cn(linkButtonVariants({ variant, size }), className)} ref={ref} {...props} />;
  }
);
LinkButton.displayName = 'LinkButton';

export { LinkButton, linkButtonVariants };
