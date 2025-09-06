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
  disabled?: boolean;
}

interface DetailItem {
  icon: React.ElementType;
  text: string | number;
  title?: string;
  className?: string;
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
  'data-testid'?: string; // Для тестирования
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
  borderColor,
  className,
  'data-testid': testId,
}) => {
  // Используем цвет по умолчанию, если borderColor не передан или пустой
  const effectiveBorderColor = borderColor || '#E5E7EB';

  return (
    <div
      data-testid={testId}
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
        borderLeftColor: isSelected ? '#3B82F6' : effectiveBorderColor,
      }}
      // Добавляем поддержку клавиатуры
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Выбрать ${title}`}
    >
      {/* Контекстное меню - появляется при hover как в ProductCard */}
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
        <DropdownMenu
          trigger={
            <button
              className="p-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600 transition-colors"
              aria-label="Открыть меню действий"
            >
              <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          }
        >
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={(e) => {
                e.stopPropagation();
                if (!item.disabled) {
                  item.onClick();
                }
              }}
              disabled={item.disabled}
              className={cn(
                'w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2',
                item.disabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : item.className || 'text-gray-900 dark:text-gray-100'
              )}
              aria-label={item.label}
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
            {/* ИСПРАВЛЕНИЕ: Применяем цвет к иконке */}
            <div className={cn('flex-shrink-0', iconColor || 'text-gray-500 dark:text-gray-400')}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-gray-300 dark:text-gray-600 font-light">•</span>
            <h3 className="font-semibold text-gray-900 dark:text-white truncate" title={title}>
              {title}
            </h3>
            {subtitle && (
              <>
                <span className="text-gray-300 dark:text-gray-600 font-light">•</span>
                <p
                  className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0"
                  title={subtitle}
                >
                  {subtitle}
                </p>
              </>
            )}
          </div>

          {/* Детали - с лучшей типографикой */}
          {details.length > 0 && (
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 flex-wrap pt-1">
              {details.map((detail, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <span className="text-gray-300 dark:text-gray-600 font-light">•</span>
                  )}
                  <div
                    className={cn('flex items-center gap-1.5', detail.className)}
                    title={detail.title}
                  >
                    <detail.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{detail.text}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntityCard;
