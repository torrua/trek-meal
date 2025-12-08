// src/ui/CollapsibleSection.tsx

import React from 'react';
import cn from 'classnames';

interface CollapsibleSectionProps {
  id: string;
  title: string | React.ReactNode;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: (id: string) => void;
  actionButton?: React.ReactNode;
  summaryContent?: React.ReactNode;
  headerContent?: React.ReactNode;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  className?: string;
  showBorder?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  id,
  title,
  icon,
  children,
  isOpen = false,
  onToggle,
  actionButton,
  summaryContent,
  headerContent,
  gradientFrom = 'gradient-primary',
  gradientVia = '',
  gradientTo = '',
  className,
  showBorder = true,
  padding = 'lg',
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  };

  const headerPaddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const contentPaddingClasses = {
    none: '',
    sm: 'pt-0',
    md: 'pt-0',
    lg: 'pt-0',
  };

  // Handle CSS gradient classes vs Tailwind gradients
  const gradientClass = gradientFrom.includes('gradient-')
    ? gradientFrom
    : `bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo}`;

  return (
    <div
      className={cn(
        'collapsible-section',
        gradientClass,
        showBorder && 'border border-border',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-3 cursor-pointer',
          headerPaddingClasses[padding]
        )}
        onClick={() => onToggle?.(id)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
            {icon}
          </div>
          <h2 className="text-lg font-semibold truncate">{title}</h2>
          {summaryContent && <div className="ml-2 flex-shrink-0">{summaryContent}</div>}
        </div>
        <div className="flex items-center gap-2 min-w-[200px] justify-end">
          {actionButton}
          {headerContent}
        </div>
      </div>
      {isOpen && (
        <div className={cn(paddingClasses[padding], contentPaddingClasses[padding])}>
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
