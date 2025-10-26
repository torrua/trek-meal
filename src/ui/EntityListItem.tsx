import React from 'react';
import cn from 'classnames';
import { MoreHorizontal, Check } from 'lucide-react';
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
}

const EntityListItem: React.FC<EntityListItemProps> = ({
  title,
  icon: Icon,
  iconColor,
  details,
  menuItems,
  isSelected,
  isMultiSelected,
  onSelect,
  onMultiSelect,
  showMultiSelect = false,
  borderColor,
  'data-testid': testId,
}) => {
  const itemClasses = cn(
    'group flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all duration-200 border-l-[3px]',
    {
      'border-primary/40 bg-primary/5 hover:bg-primary/8 hover:border-primary/60 border-l-primary':
        isSelected,
      'border-border bg-card hover:bg-card-hover hover:border-border-hover border-l-border':
        !isSelected,
      'cursor-pointer': !!onSelect,
    }
  );

  const itemStyle = borderColor && !isSelected ? { borderLeftColor: borderColor } : {};

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
    <div data-testid={testId} className={itemClasses} style={itemStyle} {...interactiveProps}>
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
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10"
          style={iconColor ? { backgroundColor: `${iconColor}1A` } : {}}
        >
          <Icon className="h-4 w-4 text-primary" style={iconColor ? { color: iconColor } : {}} />
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
