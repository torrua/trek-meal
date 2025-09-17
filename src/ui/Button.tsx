// src/ui/Button.tsx

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import cn from 'classnames';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 notion-focus-ring disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden',
  {
    variants: {
      variant: {
        primary: [
          'bg-primary text-primary-foreground notion-shadow-sm',
          'hover:bg-primary/90 hover:notion-shadow',
          'active:scale-[0.98] active:notion-shadow-sm',
        ],
        danger: [
          'bg-danger text-danger-foreground notion-shadow-sm',
          'hover:bg-danger/90 hover:notion-shadow',
          'active:scale-[0.98] active:notion-shadow-sm',
        ],
        secondary: [
          'bg-muted/80 text-foreground border notion-border-subtle',
          'hover:bg-muted hover:border-border hover:notion-shadow-sm',
          'active:scale-[0.98]',
        ],
        ghost: [
          'text-muted-foreground notion-bg-hover',
          'hover:text-foreground hover:bg-muted/60',
          'active:scale-[0.98]',
        ],
        outline: [
          'border notion-border-subtle text-foreground bg-background',
          'hover:bg-muted/50 hover:border-border',
          'active:scale-[0.98]',
        ],
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-6 text-base',
        icon: 'h-9 w-9',
        'icon-sm': 'h-8 w-8 rounded-md',
        'icon-lg': 'h-11 w-11 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <span className={cn('flex items-center gap-2', loading && 'opacity-0')}>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
