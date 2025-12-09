// src/ui/EntityListItem.tsx

import React from 'react';
import cn from 'classnames';
import { MoreHorizontal, Check } from 'lucide-react';
import type { MenuItem } from './EntityCard';
import DropdownMenu from './DropdownMenu';

export interface MetaItem {
  icon: React.ElementType;
  text: string | number | null | undefined;
  tooltip?: string;
  className?: string;
}

interface EntityListItemProps {
  title: string;
  meta?: MetaItem[];
  menuItems?: MenuItem[];
  isSelected?: boolean;
  isMultiSelected?: boolean;
  onSelect?: () => void;
  onMultiSelect?: (selected: boolean) => void;
  showMultiSelect?: boolean;
  'data-testid'?: string;
  variant?:
    | 'neutral'
    | 'meal'
    | 'info'
    | 'composition'
    | 'dish'
    | 'product'
    | 'meal-type'
    | 'category'
    | 'equipment'
    | 'participant'
    | 'trip';
  onRequestMultiSelectMode?: () => void;
  id?: number; // Добавляем id для универсального multi-select
  onToggleMultiSelect?: () => void; // Добавляем callback для включения multi-select режима
}

const EntityListItem: React.FC<EntityListItemProps> = ({
  title,
  meta = [],
  menuItems,
  isSelected,
  isMultiSelected,
  onSelect,
  onMultiSelect,
  showMultiSelect = false,
  'data-testid': testId,
  variant = 'neutral',
  onRequestMultiSelectMode,
  id, // Добавляем id в props
  onToggleMultiSelect, // Добавляем callback
}) => {
  const gradientByVariant: Record<NonNullable<EntityListItemProps['variant']>, string> = {
    neutral: 'gradient-neutral',
    info: 'gradient-equipment',
    composition: 'gradient-meal',
    meal: 'gradient-meal',
    'meal-type': 'gradient-category',
    dish: 'gradient-dish',
    product: 'gradient-product',
    category: 'gradient-category',
    equipment: 'gradient-equipment',
    participant: 'gradient-participant',
    trip: 'gradient-trip',
  };

  const itemClasses = cn(
    'group flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left cursor-pointer shadow-sm',
    gradientByVariant[variant]
  );

  const interactiveProps = onSelect
    ? {
        onClick: (e: React.MouseEvent) => {
          if (showMultiSelect && onMultiSelect) {
            e.preventDefault();
            e.stopPropagation();
            onMultiSelect(!isMultiSelected);
          } else {
            onSelect();
          }
        },
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        },
        onDoubleClick: (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          // Если передан onRequestMultiSelectMode, используем его
          if (onRequestMultiSelectMode) {
            onRequestMultiSelectMode();
          } else if (id && onMultiSelect && !showMultiSelect && onToggleMultiSelect) {
            // Универсальная логика: включаем multi-select и выделяем текущий элемент
            onToggleMultiSelect();
            onMultiSelect(true);
          }
        },
        role: 'button',
        tabIndex: 0,
        'aria-pressed': isSelected,
      }
    : {};

  return (
    <div data-testid={testId} className={itemClasses} {...interactiveProps}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Checkbox */}
        {showMultiSelect && (
          <div className="flex-shrink-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMultiSelect?.(!isMultiSelected);
              }}
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded border',
                isMultiSelected
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-border bg-background/50'
              )}
              aria-label={isMultiSelected ? 'Снять выделение' : 'Выделить'}
            >
              {isMultiSelected && <Check className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}

        {/* TITLE */}
        <div
          className="truncate font-medium text-sm text-foreground flex-1 tracking-tight"
          title={title}
        >
          {title}
        </div>

        {/* META DATA */}
        {meta.length > 0 && (
          <div className="hidden sm:flex items-center gap-4 flex-shrink-0 ml-auto mr-2">
            {meta.map((item, index) => {
              if (!item.text && item.text !== 0) return null;

              return (
                <div
                  key={index}
                  className={cn('flex items-center gap-0.5 text-xs font-medium', item.className)}
                  title={item.tooltip}
                >
                  <item.icon className={cn('w-3.5 h-3.5 text-muted-foreground')} />
                  <span className={cn('tabular-nums', item.className)}>{item.text}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MENU */}
      {menuItems && menuItems.length > 0 && (
        <div className="flex-shrink-0 pl-1">
          <DropdownMenu
            items={menuItems}
            trigger={
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground/70 transition-colors"
                aria-label="Меню действий"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            }
          />
        </div>
      )}
    </div>
  );
};

export default EntityListItem;
