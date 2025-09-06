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
    <nav className={cn('flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg', className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap',
              isActive
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
            )}
            aria-selected={isActive}
            role="tab"
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs',
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
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
