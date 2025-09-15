// src/ui/DetailPane.tsx

import React from 'react';
import cn from 'classnames';
import { ChevronDown } from 'lucide-react';

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
        'h-full flex flex-col bg-card rounded-notion-lg border border-border overflow-hidden',
        className
      )}
    >
      <div className="flex-shrink-0 p-6 border-b border-border">{children}</div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto notion-scrollbar">
          {sections.map(({ id, title, icon: Icon, content, actionButton }) => {
            const isOpen = openSections.includes(id);
            return (
              <div key={id} className="border-b border-border last:border-b-0">
                <div
                  className={cn(
                    'w-full flex justify-between items-center px-6 py-3 transition-colors cursor-pointer hover:bg-muted/50'
                  )}
                  onClick={() => onToggleSection?.(id)}
                >
                  <div className="flex items-center gap-3 min-h-[24px] flex-1 min-w-0">
                    <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div className="font-semibold text-foreground truncate">{title}</div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 min-h-[24px]">
                    {actionButton && <div onClick={(e) => e.stopPropagation()}>{actionButton}</div>}

                    {onToggleSection && (
                      <button
                        className="p-1 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSection(id);
                        }}
                      >
                        <ChevronDown
                          className={cn('w-5 h-5 transition-transform duration-200', {
                            'rotate-180': isOpen,
                          })}
                        />
                      </button>
                    )}
                  </div>
                </div>
                <div
                  className={cn(
                    'grid overflow-hidden transition-all duration-300 ease-in-out',
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  )}
                >
                  <div className="min-h-0">
                    <div className="px-6 pb-6 pt-2">{content}</div>
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
