// src/ui/Textarea.tsx

import React from 'react';
import cn from 'classnames';

interface TextareaProps extends React.ComponentPropsWithoutRef<'textarea'> {
  label?: string;
  error?: string;
  className?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, name, error, className, ...props }, ref) => {
    // --- ИСПРАВЛЕНИЕ: Убираем дублирующиеся классы, так как они теперь глобальные ---
    // Оставляем только то, что специфично для Textarea, например, обработку ошибки.
    const textareaClasses = cn({ 'border-red-500': !!error });

    return (
      <div className={className}>
        {label && (
          <label htmlFor={name} className="block text-sm font-medium text-secondary mb-1">
            {label}
          </label>
        )}
        <textarea id={name} name={name} ref={ref} className={textareaClasses} {...props} />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
