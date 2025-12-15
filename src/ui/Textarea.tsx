import React, { useId } from 'react';
import cn from 'classnames';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  description?: string;
  containerClassName?: string;
  inputSize?: 'sm' | 'md' | 'lg';
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, label, error, description, containerClassName, inputSize = 'md', ...props },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = props.id || props.name || `textarea-${generatedId}`;

    const sizeClasses = {
      sm: 'min-h-[60px] text-xs px-3 py-2',
      md: 'min-h-[80px] text-sm px-4 py-2.5',
      lg: 'min-h-[100px] text-base px-4 py-3',
    };

    return (
      <div className={cn('w-full space-y-1.5', containerClassName)}>
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}

        {description && <p className="text-xs text-muted-foreground mb-1.5">{description}</p>}

        <div className="relative">
          <textarea
            id={textareaId}
            className={cn(
              // ИЗМЕНЕНО: transition-colors
              'w-full transition-colors duration-200 ease-in-out',
              'placeholder:text-muted-foreground text-foreground',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:ring-offset-0',
              'border border-border rounded-lg bg-card',
              sizeClasses[inputSize],
              'resize-vertical',
              {
                'ring-2 ring-danger border-transparent': error,
              },
              className
            )}
            ref={ref}
            {...props}
          />

          {error && (
            <div className="absolute right-3 top-3">
              <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-danger mt-1 flex items-center gap-1.5">
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
