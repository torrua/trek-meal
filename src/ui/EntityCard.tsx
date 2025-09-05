// src/ui/EntityCard.tsx

import React from 'react';
import cn from 'classnames';
import { MoreVertical } from 'lucide-react';
import DropdownMenu from './DropdownMenu';

export interface MenuItem {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  className?: string;
}

interface DetailItem {
  icon: React.ElementType;
  text: string | number;
  title?: string;
}

interface EntityCardProps {
  title: string;
  subtitle?: string; // Новое: для возраста участника, даты похода и т.д.
  icon: React.ElementType;
  iconColor?: string; // Новое: для цветовой кодировки иконок
  details: DetailItem[];
  menuItems: MenuItem[];
  isSelected: boolean;
  onSelect: () => void;
  borderColor?: string;
  className?: string;
}

const EntityCard: React.FC<EntityCardProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  details,
  menuItems,
  isSelected,
  onSelect,
  borderColor = 'transparent',
  className,
}) => {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'group relative bg-white dark:bg-gray-800 rounded-lg border transition-all duration-200 hover:shadow-lg cursor-pointer',
        'border-l-4',
        isSelected
          ? 'border-blue-500 shadow-blue-100 dark:shadow-blue-900/20 shadow-md ring-1 ring-blue-500/30'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
        className
      )}
      style={{
        borderLeftColor: isSelected ? '#3B82F6' : borderColor,
      }}
    >
      {/* Контекстное меню - появляется при hover как в ProductCard */}
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
        <DropdownMenu
          trigger={
            <button className="p-1.5 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md border border-gray-200 dark:border-gray-600">
              <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          }
        >
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
              }}
              className={cn(
                'w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2',
                item.className || 'text-gray-900 dark:text-gray-100'
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </DropdownMenu>
      </div>

      {/* Основной контент - улучшенная структура из ParticipantCard */}
      <div className="p-4">
        <div className="min-w-0 flex-1 space-y-2">
          {/* Заголовок с подзаголовком - как в ParticipantCard */}
          <div className="flex items-center gap-2 pr-8">
            <div className={cn('text-gray-500 dark:text-gray-400', iconColor)}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-gray-300 dark:text-gray-600 font-light">•</span>
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{title}</h3>
            {subtitle && (
              <>
                <span className="text-gray-300 dark:text-gray-600 font-light">•</span>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">{subtitle}</p>
              </>
            )}
          </div>

          {/* Детали - с лучшей типографикой */}
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 flex-wrap pt-1">
            {details.map((detail, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <span className="text-gray-300 dark:text-gray-600 font-light">•</span>
                )}
                <div className="flex items-center gap-1.5" title={detail.title}>
                  <detail.icon className="w-4 h-4" />
                  <span className="font-medium">{detail.text}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntityCard;
