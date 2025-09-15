// src/ui/Button.tsx - Notion-inspired button component

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import cn from 'classnames';

const notionButtonVariants = cva(
  // Base styles matching Notion's design
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-100 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: [
          'bg-primary text-white shadow-notion-sm',
          'hover:bg-primary/90 hover:shadow-notion-md',
          'active:scale-[0.98]',
        ],
        secondary: [
          'bg-white dark:bg-dark-secondary text-foreground dark:text-white',
          'border border-border dark:border-dark-border',
          'hover:bg-muted dark:hover:bg-dark-tertiary hover:border-border/50',
          'active:scale-[0.98]',
        ],
        ghost: [
          'text-muted-foreground',
          'hover:bg-muted dark:hover:bg-dark-tertiary hover:text-foreground dark:hover:text-white',
        ],
        danger: [
          'bg-danger/10 text-danger border border-danger/20',
          'hover:bg-danger hover:text-white hover:border-danger',
          'active:scale-[0.98]',
        ],
        notion: [
          // Special Notion-style button
          'bg-transparent text-foreground dark:text-white',
          'hover:bg-[rgba(55,53,47,0.08)] dark:hover:bg-[rgba(255,255,255,0.055)]',
          'active:bg-[rgba(55,53,47,0.16)] dark:active:bg-[rgba(255,255,255,0.094)]',
        ],
      },
      size: {
        sm: 'h-7 px-2.5 text-xs rounded-notion-sm',
        default: 'h-8 px-3 text-sm rounded-notion-md',
        lg: 'h-10 px-4 text-base rounded-notion-md',
        icon: 'h-8 w-8 rounded-notion-md',
        'icon-sm': 'h-7 w-7 rounded-notion-sm',
      },
      // Notion-specific property for button style
      notion: {
        true: 'font-normal tracking-normal',
        false: 'font-medium',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      notion: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof notionButtonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, notion, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(notionButtonVariants({ variant, size, notion, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
