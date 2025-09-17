// ============================================
// src/ui/Textarea.tsx - Notion-style textarea
// ============================================

import React from 'react';
import cn from 'classnames';
import { AlertCircle } from 'lucide-react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  hint?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      name,
      value,
      onChange,
      placeholder,
      rows = 4,
      error,
      disabled = false,
      containerClassName,
      className,
      hint,
      required,
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

        <textarea
          id={name}
          ref={ref}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={cn(
            'w-full min-h-[80px] px-3 py-2',
            'bg-white dark:bg-dark-tertiary',
            'border border-border dark:border-dark-border rounded-notion-md',
            'text-notion-sm text-foreground dark:text-white placeholder:text-muted-foreground/60',
            'transition-all duration-100 resize-vertical',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10',
            'hover:border-border/70 dark:hover:border-dark-borderMedium',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:resize-none',
            error && 'border-danger focus:ring-danger/10',
            className
          )}
          {...props}
        />

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

Textarea.displayName = 'Textarea';

export default Textarea;
