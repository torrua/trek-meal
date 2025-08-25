// src/ui/Input.tsx

import React from 'react';
import cn from 'classnames';

interface InputProps extends React.ComponentPropsWithoutRef<'input'> {
  label?: string;
  error?: string;
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, name, error, className, ...props }, ref) => {
    const inputClasses = cn(
      'w-full h-10 px-3 bg-secondary border border-primary text-primary rounded-md shadow-sm',
      'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none',
      'disabled:bg-muted disabled:cursor-not-allowed',
      { 'border-red-500': !!error }
    );

    return (
      <div className={className}>
        {label && (
          <label htmlFor={name} className="block text-sm font-medium text-secondary mb-1">
            {label}
          </label>
        )}
        <input id={name} name={name} ref={ref} className={inputClasses} {...props} />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
