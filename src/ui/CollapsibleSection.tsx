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
}) => {
  const gradientClass = gradientFrom.includes('gradient-')
    ? gradientFrom
    : `bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo}`;

  return (
    <div
      className={cn(
        'rounded-xl shadow-sm',
        gradientClass,
        showBorder && 'border border-border',
        className
      )}
    >
      <div
        className="flex items-center justify-between gap-3 p-5 cursor-pointer select-none"
        onClick={() => onToggle?.(id)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/50 backdrop-blur-sm shadow-sm flex-shrink-0">
            {icon}
          </div>
          {/* ИЗМЕНЕНО: text-xl для заголовка блока (увеличено) */}
          <h2 className="text-xl font-semibold truncate text-foreground/90">{title}</h2>
          {summaryContent && <div className="ml-2 flex-shrink-0">{summaryContent}</div>}
        </div>

        <div className="flex items-center gap-2 min-w-[140px] justify-end">
          {actionButton}
          {headerContent}
        </div>
      </div>

      {isOpen && <div className="p-5 pt-0">{children}</div>}
    </div>
  );
};

export default CollapsibleSection;
