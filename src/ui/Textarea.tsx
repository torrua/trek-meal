// src/ui/Textarea.tsx

import React from 'react';
import cn from 'classnames';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, containerClassName, ...props }, ref) => {
    const textareaId =
      props.id || props.name || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-foreground tracking-tight mb-2"
          >
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            'flex min-h-[80px] w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm',
            'placeholder:text-muted-foreground text-foreground transition-all duration-200',
            'hover:border-border-hover focus:border-primary/60 focus:bg-card',
            'focus:outline-none focus:ring-2 focus:ring-primary/20',
            'disabled:cursor-not-allowed disabled:opacity-50 resize-vertical',
            error && 'border-danger focus:border-danger focus:ring-danger/20',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <div className="mt-2 flex items-center gap-2 text-sm text-danger">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export default Textarea;
