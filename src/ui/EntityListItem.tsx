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
    | 'category';
  onRequestMultiSelectMode?: () => void;
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
}) => {
  const gradientByVariant: Record<NonNullable<EntityListItemProps['variant']>, string> = {
    neutral: 'bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/10 dark:to-transparent',
    info: 'bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5',
    composition: '[background:var(--color-meal-composition-gradient)]',
    meal: '[background:var(--color-meal-composition-gradient)]',
    'meal-type': '[background:var(--color-meal-type-gradient)]',
    dish: '[background:var(--color-dish-gradient)]',
    product: '[background:var(--color-product-gradient)]',
    category: '[background:var(--color-meal-type-gradient)]',
  };

  const itemClasses = cn(
    'group flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left cursor-pointer',
    gradientByVariant[variant],
    {
      'border border-border': !isSelected,
      'shadow-md ring-2 ring-primary/20': isSelected,
    }
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
          onRequestMultiSelectMode?.();
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
                'flex h-5 w-5 items-center justify-center rounded border transition-all duration-200',
                isMultiSelected
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-border bg-background/50 hover:border-primary/50'
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
                  <item.icon
                    className={cn(
                      'w-3.5 h-3.5',
                      item.className ? 'opacity-90' : 'text-muted-foreground'
                    )}
                  />
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
                className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground/70 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
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
