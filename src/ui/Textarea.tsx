// src/ui/Textarea.tsx

import React from 'react';
import cn from 'classnames';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, name, error, containerClassName, ...props }, ref) => {
    // Стили переехали сюда
    const baseClasses =
      'flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors min-h-[80px]';

    const textareaClasses = cn(baseClasses, className, {
      'border-danger focus-visible:ring-danger': !!error,
    });

    return (
      <div className={containerClassName}>
        {label && (
          <label htmlFor={name} className="block text-sm font-medium text-foreground mb-1.5">
            {label}
          </label>
        )}
        <textarea className={textareaClasses} ref={ref} name={name} {...props} />
        {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export default Textarea;
