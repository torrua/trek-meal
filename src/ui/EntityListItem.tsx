import React from 'react';
import cn from 'classnames';
import { MoreHorizontal, Check, Flame, Weight, Hash } from 'lucide-react';
import type { MenuItem } from './EntityCard';
import DropdownMenu from './DropdownMenu';

interface EntityListItemProps {
  title: string;
  icon: React.ElementType;
  iconColor?: string;
  details?: (string | React.ReactNode)[];
  menuItems?: MenuItem[];
  isSelected?: boolean;
  isMultiSelected?: boolean;
  onSelect?: () => void;
  onMultiSelect?: (selected: boolean) => void;
  showMultiSelect?: boolean;
  borderColor?: string;
  'data-testid'?: string;
  variant?: 'neutral' | 'meal' | 'info' | 'composition';
  nutrition?: {
    calories: number;
    weight: number;
    itemsCount?: number;
  };
}

const EntityListItem: React.FC<EntityListItemProps> = ({
  title,
  icon: Icon,
  iconColor: _iconColor,
  details,
  menuItems,
  isSelected,
  isMultiSelected,
  onSelect,
  onMultiSelect,
  showMultiSelect = false,
  borderColor: _borderColor,
  'data-testid': testId,
  variant = 'neutral',
  nutrition,
}) => {
  const gradientByVariant: Record<NonNullable<EntityListItemProps['variant']>, string> = {
    neutral: 'bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5',
    info: 'bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5',
    composition: 'bg-gradient-to-br from-orange-500/5 via-yellow-500/5 to-green-500/5',
    meal: 'bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-blue-500/5',
  };

  const itemClasses = cn(
    'group flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-all duration-200',
    gradientByVariant[variant],
    {
      'border-primary/50 bg-primary/10 hover:bg-primary/15 hover:border-primary/60': isSelected,
      'hover:bg-card-hover hover:border-border-hover': !isSelected,
      'cursor-pointer': !!onSelect,
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
        role: 'button',
        tabIndex: 0,
        'aria-pressed': isSelected,
      }
    : {};

  return (
    <div data-testid={testId} className={itemClasses} {...interactiveProps}>
      {/* LOGIC CHANGE: Checkbox replaces the icon */}
      {showMultiSelect ? (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center">
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
                : 'border-border bg-card hover:border-border-hover'
            )}
            aria-label={isMultiSelected ? 'Снять выделение' : 'Выделить'}
          >
            {isMultiSelected && <Check className="h-4 w-4" />}
          </button>
        </div>
      ) : (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      )}

      {/* Основной контент */}
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <h3 className="truncate text-sm font-medium text-foreground">{title}</h3>
        {details && details.length > 0 && (
          <div className="hidden flex-shrink-0 items-center gap-3 text-xs text-muted-foreground md:flex">
            {details.map((detail, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="select-none text-muted-foreground/40">•</span>}
                <div className="font-medium">{detail}</div>
              </React.Fragment>
            ))}
          </div>
        )}

        {nutrition && (
          <div className="ml-auto flex items-center gap-2 text-xs">
            {typeof nutrition.itemsCount === 'number' && (
              <div className="flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-semibold text-muted-foreground">{nutrition.itemsCount}</span>
              </div>
            )}
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-600" />
              <span className="font-semibold text-orange-600">
                {Math.round(nutrition.calories)}
              </span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1">
              <Weight className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-semibold text-muted-foreground">
                {Math.round(nutrition.weight)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Меню действий */}
      {menuItems && menuItems.length > 0 && (
        <div className="ml-auto pl-2">
          <DropdownMenu
            items={menuItems}
            trigger={
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="rounded-lg p-2 text-muted-foreground transition-all duration-200 hover:bg-muted/60 hover:text-foreground group-hover:opacity-100 lg:opacity-0"
                aria-label="More options"
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
