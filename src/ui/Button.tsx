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
          'bg-primary text-primary-foreground notion-shadow-xs',
          'hover:bg-primary-hover hover:notion-shadow-sm hover:-translate-y-0.5',
          'active:scale-[0.98] active:translate-y-0',
        ],
        danger: [
          'bg-danger text-danger-foreground notion-shadow-xs',
          'hover:bg-danger/90 hover:notion-shadow-sm hover:-translate-y-0.5',
          'active:scale-[0.98] active:translate-y-0',
        ],
        secondary: [
          'bg-muted text-foreground border border-border',
          'hover:bg-muted/80 hover:border-border-hover hover:notion-shadow-xs hover:-translate-y-0.5',
          'active:scale-[0.98] active:translate-y-0',
        ],
        ghost: [
          'text-muted-foreground',
          'hover:text-foreground hover:bg-muted/60',
          'active:scale-[0.98]',
        ],
        outline: [
          'border border-border text-foreground bg-card',
          'hover:bg-muted/40 hover:border-border-hover hover:-translate-y-0.5',
          'active:scale-[0.98] active:translate-y-0',
        ],
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-xl px-6 text-base',
        icon: 'h-9 w-9',
        'icon-sm': 'h-8 w-8 rounded-md',
        'icon-lg': 'h-11 w-11 rounded-xl',
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
  icon?: React.ElementType;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, icon: Icon, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        )}
        <span className={cn('flex items-center justify-center gap-2', loading && 'opacity-0')}>
          {Icon && <Icon className="h-4 w-4" />}
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
