import React from 'react';
import { Link } from 'react-router-dom';
import cn from 'classnames';
import { MoreHorizontal, Check, Flame, Beef, Droplet, Wheat, Weight, Hash } from 'lucide-react';
import DropdownMenu from './DropdownMenu';

export interface MenuItem {
  label: string;
  icon: React.ElementType;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  disabled?: boolean;
}

export interface DetailItem {
  key: string;
  icon: React.ElementType;
  text: string | number;
  title?: string;
  className?: string;
}

interface EntityCardProps {
  title: string;
  subtitle?: React.ReactNode;
  icon: React.ElementType | (() => React.ReactElement);
  iconColor?: string;
  details?: DetailItem[];
  menuItems?: MenuItem[];
  isSelected?: boolean;
  isMultiSelected?: boolean;
  onSelect?: () => void;
  onMultiSelect?: (selected: boolean) => void;
  borderColor?: string;
  className?: string;
  'data-testid'?: string;
  linkTo?: string;
  description?: string;
  showMultiSelect?: boolean;
  variant?: 'neutral' | 'meal' | 'info' | 'composition';
  nutrition?: {
    calories: number;
    proteins: number;
    fats: number;
    carbs: number;
    weight: number;
    itemsCount?: number;
  };
}

const EntityCard: React.FC<EntityCardProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor: _iconColor,
  details,
  menuItems,
  isSelected,
  isMultiSelected,
  onSelect,
  onMultiSelect,
  borderColor: _borderColor,
  className,
  'data-testid': testId,
  linkTo,
  description,
  showMultiSelect = false,
  variant = 'neutral',
  nutrition,
}) => {
  const gradientByVariant: Record<NonNullable<EntityCardProps['variant']>, string> = {
    neutral: 'bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5',
    info: 'bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5',
    composition: 'bg-gradient-to-br from-orange-500/5 via-yellow-500/5 to-green-500/5',
    meal: 'bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-blue-500/5',
  };

  const cardClasses = cn(
    'block rounded-xl border border-border p-6 transition-all duration-200 cursor-pointer relative',
    gradientByVariant[variant],
    {
      // Selected state
      'border-primary/50 bg-primary/10 hover:bg-primary/15 hover:border-primary/60': isSelected,
      // Default state
      'hover:bg-card-hover hover:border-border-hover': !isSelected,
    },
    className
  );

  const cardContent = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {/* LOGIC CHANGE: Checkbox replaces the icon */}
          {showMultiSelect ? (
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center">
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
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors duration-200">
              {typeof Icon === 'function' ? <Icon /> : <Icon className="h-4 w-4 text-primary" />}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3
              className="truncate text-lg font-semibold leading-snug text-foreground"
              title={title}
            >
              {title}
            </h3>
            {subtitle && (
              <div className="mt-0.5 text-sm leading-snug text-muted-foreground">{subtitle}</div>
            )}
            {description && (
              <p className="mt-1 truncate text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>

        {menuItems && menuItems.length > 0 && (
          <DropdownMenu
            items={menuItems}
            trigger={
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="notion-focus-ring rounded-lg p-2 text-muted-foreground transition-all duration-200 hover:bg-muted/60 hover:text-foreground"
                aria-label="More options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            }
          />
        )}
      </div>

      {details && details.length > 0 && (
        <div className="mt-4 border-t border-border/60 pt-4">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            {details.map((item) => (
              <div key={item.key} className="flex items-center gap-2" title={item.title}>
                <item.icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <dt className="sr-only">{item.key}</dt>
                <dd className={cn('truncate font-medium text-foreground/90', item.className)}>
                  {item.text}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {nutrition && (
        <div className="mt-3 border-t border-border pt-3">
          <div
            className={cn(
              'grid w-full gap-2 text-sm justify-items-center',
              typeof nutrition.itemsCount === 'number' ? 'grid-cols-6' : 'grid-cols-5'
            )}
          >
            {typeof nutrition.itemsCount === 'number' && (
              <div className="flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-semibold text-muted-foreground">{nutrition.itemsCount}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-600" />
              <span className="font-semibold text-orange-600">
                {Math.round(nutrition.calories)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Beef className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-semibold text-blue-600">
                {Math.round(nutrition.proteins * 10) / 10}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-yellow-600" />
              <span className="font-semibold text-yellow-600">
                {Math.round(nutrition.fats * 10) / 10}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Wheat className="w-3.5 h-3.5 text-green-600" />
              <span className="font-semibold text-green-600">
                {Math.round(nutrition.carbs * 10) / 10}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Weight className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-semibold text-muted-foreground">
                {Math.round(nutrition.weight)}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const interactiveProps = {
    onClick: (e: React.MouseEvent) => {
      if (showMultiSelect && onMultiSelect) {
        e.preventDefault();
        e.stopPropagation();
        onMultiSelect(!isMultiSelected);
      } else {
        onSelect?.();
      }
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (showMultiSelect && e.shiftKey) {
          onMultiSelect?.(!isMultiSelected);
        } else {
          onSelect?.();
        }
      }
    },
    role: 'button',
    tabIndex: onSelect ? 0 : -1,
    'aria-pressed': isSelected,
    'data-testid': testId,
  };

  if (linkTo) {
    return (
      <Link to={linkTo} className={cardClasses}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={cardClasses} {...interactiveProps}>
      {cardContent}
    </div>
  );
};

export default EntityCard;
