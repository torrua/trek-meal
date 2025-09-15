// ============================================
// src/ui/Input.tsx - Notion-style input
// ============================================

import React from 'react';
import cn from 'classnames';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
  containerClassName?: string;
  hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      type = 'text',
      name,
      value,
      onChange,
      placeholder,
      required,
      error,
      icon: Icon,
      disabled = false,
      containerClassName,
      className,
      hint,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={name}
            className="block text-notion-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5"
          >
            {label}
            {required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          )}

          <input
            id={name}
            ref={ref}
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'w-full h-9 bg-white dark:bg-dark-tertiary',
              'border border-border dark:border-dark-border rounded-notion-md',
              'text-notion-sm text-foreground dark:text-white placeholder:text-muted-foreground/60',
              'transition-all duration-100',
              'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10',
              'hover:border-border/70 dark:hover:border-dark-borderMedium',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border',
              Icon ? 'pl-9 pr-3' : 'px-3',
              error && 'border-danger focus:ring-danger/10',
              className
            )}
            {...props}
          />
        </div>

        {hint && !error && <p className="text-notion-xs text-muted-foreground mt-1.5">{hint}</p>}

        {error && (
          <p className="text-notion-xs text-danger flex items-center gap-1 mt-1.5">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
