// src/ui/Select.tsx

import React from 'react';
import cn from 'classnames';
import { AlertCircle } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
  containerClassName?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      name,
      value,
      onChange,
      options,
      required,
      error,
      disabled = false,
      containerClassName,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('space-y-1.5', containerClassName)}>
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          id={name}
          ref={ref}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={cn(
            'w-full px-4 py-3 bg-white dark:bg-gray-700 border rounded-xl shadow-sm transition-all appearance-none cursor-pointer text-sm',
            error
              ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            disabled ? 'bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed' : '',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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

Select.displayName = 'Select';

export default Select;
