import React, { useId } from 'react';
import cn from 'classnames';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  containerClassName?: string;
  variant?: 'default' | 'ghost' | 'search';
  inputSize?: 'sm' | 'md' | 'lg';
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
      description,
      icon: Icon,
      disabled = false,
      containerClassName,
      className,
      variant = 'default',
      inputSize = 'md',
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = name || `input-${generatedId}`;

    const sizeClasses = {
      sm: 'h-8 text-xs px-3',
      md: 'h-10 text-sm px-4',
      lg: 'h-12 text-base px-4',
    };

    return (
      <div className={cn('w-full space-y-1.5', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}

        {description && <p className="text-xs text-muted-foreground mb-1.5">{description}</p>}

        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          )}

          <input
            id={inputId}
            ref={ref}
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              // ИЗМЕНЕНО: transition-colors (вместо all) предотвращает пересчет геометрии,
              // что делает анимацию рамки и тени идеально плавной без "дрожания".
              'w-full transition-colors duration-200 ease-in-out',
              'placeholder:text-muted-foreground text-foreground',
              'disabled:cursor-not-allowed disabled:opacity-50',
              // focus:border-primary (вместо transparent) убирает моргание
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:ring-offset-0',
              'border border-border rounded-lg',
              sizeClasses[inputSize],
              'py-2',
              {
                'pl-10': Icon,
                'pr-10': error,
                'bg-white dark:bg-card': variant === 'default',
                'bg-transparent border-0': variant === 'ghost',
                'bg-muted/30 hover:bg-muted/50': variant === 'ghost',
                'ring-2 ring-danger border-transparent': error,
                'focus:ring-0 focus:border-primary': variant === 'ghost',
              },
              className
            )}
            {...props}
          />

          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
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

Input.displayName = 'Input';

export default Input;
