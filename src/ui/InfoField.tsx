// src/ui/InfoField.tsx

import React from 'react';
import cn from 'classnames';

interface InfoFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  label: string;
  value: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

const InfoField: React.FC<InfoFieldProps> = ({
  icon: Icon,
  iconClassName,
  label,
  value,
  className,
  'data-testid': testId,
}) => (
  <div
    className={cn(
      'p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600',
      className
    )}
    data-testid={testId}
  >
    <div className="flex items-start gap-3">
      <div className={cn('text-muted-foreground mt-0.5 flex-shrink-0', iconClassName)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="text-sm font-medium text-foreground mt-0.5">{value}</div>
      </div>
    </div>
  </div>
);

export default InfoField;
