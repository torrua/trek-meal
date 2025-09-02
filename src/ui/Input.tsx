// src/ui/Input.tsx

import React from 'react';
import cn from 'classnames';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
  containerClassName?: string;
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
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('space-y-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={name}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          )}
          <input
            id={name}
            ref={ref}
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'w-full px-4 py-3 bg-white dark:bg-gray-700 border rounded-xl shadow-sm transition-all text-sm',
              Icon ? 'pl-11' : 'px-4',
              error
                ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              disabled ? 'bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed' : '',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
