// src/ui/InfoField.tsx

import React from 'react';
import cn from 'classnames';

interface InfoFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  className?: string;
  variant?: 'default' | 'compact';
  'data-testid'?: string;
}

const InfoField: React.FC<InfoFieldProps> = ({
  icon: Icon,
  iconClassName,
  label,
  value,
  valueClassName,
  className,
  variant = 'default',
  'data-testid': testId,
}) => (
  <div
    className={cn(
      'rounded-xl border notion-border-subtle notion-bg-hover bg-card',
      'hover:border-border hover:notion-shadow-sm',
      variant === 'default' ? 'p-4' : 'p-3',
      className
    )}
    data-testid={testId}
  >
    <div className="flex items-start gap-3">
      {/* Icon container with Notion-style background */}
      <div
        className={cn(
          'flex-shrink-0 rounded-lg flex items-center justify-center border notion-border-subtle',
          variant === 'default' ? 'w-8 h-8 bg-muted/50' : 'w-6 h-6 bg-muted/30',
          iconClassName || 'text-muted-foreground'
        )}
      >
        <Icon className={cn(variant === 'default' ? 'w-4 h-4' : 'w-3.5 h-3.5')} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1">
        <p
          className={cn(
            'font-medium text-muted-foreground tracking-tight',
            variant === 'default' ? 'text-sm' : 'text-xs'
          )}
        >
          {label}
        </p>
        <div
          className={cn(
            'font-semibold tracking-tight',
            variant === 'default' ? 'text-base' : 'text-sm',
            valueClassName || 'text-foreground'
          )}
        >
          {value}
        </div>
      </div>
    </div>
  </div>
);

export default InfoField;
