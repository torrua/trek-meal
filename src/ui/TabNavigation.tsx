// src/ui/TabNavigation.tsx

import React from 'react';
import cn from 'classnames';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ElementType;
  count?: number;
}

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  return (
    <nav className={cn('flex space-x-1 bg-muted p-1 rounded-notion-md', className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-notion-sm text-notion-sm font-medium transition-all duration-200 whitespace-nowrap',
              isActive
                ? 'bg-card text-foreground shadow-notion-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
            aria-selected={isActive}
            role="tab"
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-notion-xs',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted-foreground/10 text-muted-foreground'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default TabNavigation;
