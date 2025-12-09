// src/components/shared/CollapsibleSection.tsx

import React from 'react';

interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: (id: string) => void;
  actionButton?: React.ReactNode;
  summaryContent?: React.ReactNode;
  headerContent?: React.ReactNode;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  className?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  id,
  title,
  icon,
  children,
  isOpen,
  onToggle,
  actionButton,
  summaryContent,
  headerContent,
  gradientFrom = 'gradient-basic-info',
  gradientVia = '',
  gradientTo = '',
  className,
}) => {
  return (
    <div className={`${className || ''} collapsible-section`}>
      <div
        className={`${
          gradientFrom.includes('gradient-')
            ? gradientFrom
            : `bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo}`
        } collapsible-section-gradient`}
      ></div>
      <div className="relative">
        <div
          className="flex items-center justify-between gap-3 p-6 cursor-pointer"
          onClick={() => onToggle(id)}
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
        {isOpen && <div className="p-6 pt-0">{children}</div>}
      </div>
    </div>
  );
};

export default CollapsibleSection;
