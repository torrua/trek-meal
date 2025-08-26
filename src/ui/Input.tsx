// src/ui/Input.tsx

import React from 'react';
import cn from 'classnames';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, name, error, containerClassName, ...props }, ref) => {
    // Стили переехали сюда из index.css
    const baseClasses =
      'flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors';

    const inputClasses = cn(baseClasses, className, {
      'border-danger focus-visible:ring-danger': !!error,
    });

    return (
      <div className={containerClassName}>
        {label && (
          <label htmlFor={name} className="block text-sm font-medium text-foreground mb-1.5">
            {label}
          </label>
        )}
        <input type={type} className={inputClasses} ref={ref} name={name} {...props} />
        {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export default Input;
