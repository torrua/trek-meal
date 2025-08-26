import React from 'react';
import cn from 'classnames';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, name, error, containerClassName, ...props }, ref) => {
    const textareaClasses = cn(
      'min-h-[80px]', // Задаем минимальную высоту
      className,
      { 'border-danger focus-visible:ring-danger': !!error }
    );

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
