// src/ui/FormField.tsx
import React from 'react';
import cn from 'classnames';

interface FormFieldProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  description,
  error,
  required,
  className,
  children,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className={cn('block text-sm font-medium text-foreground tracking-tight')}>
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {children}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
};

export default FormField;
