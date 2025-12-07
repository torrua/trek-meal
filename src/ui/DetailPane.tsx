// src/ui/DetailPane.tsx

import React from 'react';
import cn from 'classnames';

interface Section {
  id: string;
  title: string | React.ReactNode;
  icon: React.ElementType;
  content: React.ReactNode;
  actionButton?: React.ReactNode;
  defaultOpen?: boolean;
}

interface DetailPaneProps {
  children: React.ReactNode;
  sections: Section[];
  openSections: string[];
  onToggleSection?: (sectionId: string) => void;
  className?: string;
}

const DetailPane: React.FC<DetailPaneProps> = ({
  children,
  sections,
  openSections,
  onToggleSection,
  className,
}) => {
  return (
    <div
      className={cn(
        'h-full flex flex-col bg-card rounded-2xl border notion-border-subtle overflow-hidden notion-shadow-sm',
        className
      )}
    >
      {/* Header section with Notion-style padding */}
      <div className="flex-shrink-0 p-8 border-b notion-border-subtle bg-card">{children}</div>

      {/* Scrollable sections */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto notion-scrollbar">
          {sections.map(({ id, title, icon: Icon, content, actionButton }) => {
            const isOpen = openSections?.includes(id) ?? false;

            return (
              <div key={id} className="border-b notion-border-subtle last:border-b-0">
                {/* Section header */}
                <div
                  className={cn(
                    'w-full flex justify-between items-center px-8 py-5 transition-all duration-200',
                    'notion-bg-hover',
                    onToggleSection && 'cursor-pointer',
                    isOpen && 'bg-muted/30'
                  )}
                  onClick={() => onToggleSection?.(id)}
                >
                  <div className="flex items-center gap-4 min-h-[24px] flex-1 min-w-0">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                        'bg-muted/50 border notion-border-subtle',
                        isOpen
                          ? 'text-primary bg-primary/10 border-primary/20'
                          : 'text-muted-foreground'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="font-semibold text-foreground truncate text-base tracking-tight">
                      {title}
                    </div>
                  </div>

                  {/* Action buttons area */}
                  <div className="flex items-center gap-3 flex-shrink-0 min-h-[24px]">
                    {actionButton && <div onClick={(e) => e.stopPropagation()}>{actionButton}</div>}
                  </div>
                </div>

                {/* Collapsible content with Notion-style animation */}
                <div
                  className={cn(
                    'grid transition-all duration-300 ease-out overflow-hidden',
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  )}
                >
                  <div className="min-h-0">
                    <div className="px-8 pb-8 pt-2">{content}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DetailPane;
