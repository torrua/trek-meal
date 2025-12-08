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
            'flex min-h-[80px] w-full rounded-lg bg-card px-4 py-2.5 text-sm',
            'placeholder:text-muted-foreground text-foreground transition-colors duration-200 border-transition',
            'focus:shadow-md focus:ring-2 focus:ring-primary/20 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50 resize-vertical',
            error && 'ring-2 ring-danger',
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
