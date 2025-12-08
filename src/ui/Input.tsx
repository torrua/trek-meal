// src/ui/Input.tsx

import React from 'react';
import cn from 'classnames';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
  containerClassName?: string;
  variant?: 'default' | 'ghost';
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
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const inputId = name || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn('w-full space-y-2', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground tracking-tight"
          >
            {label}
            {required && <span className="text-danger ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          )}

          <input
            id={inputId}
            ref={ref}
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              // Base styles - Notion-inspired
              'flex w-full text-sm transition-colors duration-200 border-transition',
              'placeholder:text-muted-foreground text-foreground',
              'disabled:cursor-not-allowed disabled:opacity-50',

              // Variant styles
              variant === 'default' && [
                'h-10 rounded-lg bg-card px-4 py-2',
                'focus:shadow-md focus:ring-2 focus:ring-primary/20 focus:outline-none',
                error && 'ring-2 ring-danger',
              ],

              variant === 'ghost' && [
                'h-9 rounded-md px-3 py-2 border-0 bg-muted/30',
                'hover:bg-muted/50',
                'focus:outline-none',
              ],

              // Icon padding
              Icon ? 'pl-10' : '',

              className
            )}
            {...props}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-danger">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
