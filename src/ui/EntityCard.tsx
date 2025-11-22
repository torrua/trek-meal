// src/ui/EntityCard.tsx

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import cn from 'classnames';
import { MoreHorizontal, Check, Flame, Beef, Droplet, Wheat, Weight, Hash } from 'lucide-react';
import DropdownMenu from './DropdownMenu';
import './entityCard.css';

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
  onRequestMultiSelectMode?: () => void;
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
  viewMode?: 'default' | 'compact';
}

let globalShowBjuCard = true;
const cardListeners = new Set<(show: boolean) => void>();

const subscribeToShowBjuCard = (callback: (show: boolean) => void) => {
  cardListeners.add(callback);
  return () => cardListeners.delete(callback);
};

const setGlobalShowBjuCard = (show: boolean) => {
  if (globalShowBjuCard !== show) {
    globalShowBjuCard = show;
    cardListeners.forEach((callback) => callback(show));
  }
};

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
  onRequestMultiSelectMode,
  borderColor: _borderColor,
  className,
  'data-testid': testId,
  linkTo,
  description,
  showMultiSelect = false,
  variant = 'neutral',
  nutrition,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const nutritionRef = useRef<HTMLDivElement | null>(null);
  const [showBju, setShowBju] = useState(globalShowBjuCard);
  const measureTimeoutRef = useRef<number>();

  useEffect(() => {
    return subscribeToShowBjuCard(setShowBju);
  }, []);

  useEffect(() => {
    const el = nutritionRef.current;
    if (!el || !nutrition) return;

    const measure = () => {
      if (measureTimeoutRef.current) {
        window.clearTimeout(measureTimeoutRef.current);
      }

      measureTimeoutRef.current = window.setTimeout(() => {
        const testDiv = el.cloneNode(true) as HTMLElement;
        testDiv.style.position = 'absolute';
        testDiv.style.visibility = 'hidden';
        testDiv.style.width = `${el.clientWidth}px`;
        testDiv.classList.add('show-bju');
        el.parentElement?.appendChild(testDiv);

        const fits = testDiv.scrollWidth <= testDiv.clientWidth + 2;
        el.parentElement?.removeChild(testDiv);

        setGlobalShowBjuCard(fits);
      }, 50);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    return () => {
      ro.disconnect();
      if (measureTimeoutRef.current) window.clearTimeout(measureTimeoutRef.current);
    };
  }, [nutrition]);

  const gradientByVariant: Record<NonNullable<EntityCardProps['variant']>, string> = {
    neutral: 'bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5',
    info: 'bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5',
    composition: 'bg-gradient-to-br from-orange-500/5 via-yellow-500/5 to-green-500/5',
    meal: 'bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-blue-500/5',
  };

  const cardClasses = cn(
    'group relative flex flex-col rounded-xl border border-border p-4 transition-all duration-200 cursor-pointer bg-card',
    gradientByVariant[variant],
    {
      'border-primary/50 bg-primary/5': isSelected,
      'hover:bg-card-hover hover:border-border-hover notion-shadow-xs hover:notion-shadow-sm':
        !isSelected,
    },
    className
  );

  const cardContent = (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
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
                    : 'border-primary/40 bg-card hover:border-primary/60'
                )}
                aria-label={isMultiSelected ? 'Снять выделение' : 'Выделить'}
              >
                {isMultiSelected && <Check className="h-3.5 w-3.5" />}
              </button>
            </div>
          ) : (
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors duration-200"
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRequestMultiSelectMode?.();
              }}
            >
              {typeof Icon === 'function' ? <Icon /> : <Icon className="h-4 w-4 text-primary" />}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3
              className="truncate text-sm font-semibold leading-tight text-foreground"
              title={title}
            >
              {title}
            </h3>
            {subtitle && (
              <div className="mt-0.5 text-xs text-muted-foreground truncate">{subtitle}</div>
            )}
          </div>
        </div>

        {menuItems && menuItems.length > 0 && (
          <div className="flex-shrink-0 -mr-1.5 -mt-1.5">
            <DropdownMenu
              items={menuItems}
              trigger={
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 lg:opacity-0 focus:opacity-100"
                  aria-label="Меню действий"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              }
            />
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="mb-3 line-clamp-2 text-xs text-muted-foreground/80 leading-relaxed">
          {description}
        </p>
      )}

      {/* Details Footer */}
      {details && details.length > 0 && (
        <div className="mt-auto pt-1">
          <dl className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
            {details.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-1.5 overflow-hidden"
                title={item.title}
              >
                <item.icon className="h-3 w-3 flex-shrink-0 text-muted-foreground/70" />
                <dd className={cn('truncate font-medium text-foreground/80', item.className)}>
                  {item.text}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Nutrition Footer */}
      {nutrition && (
        <div className="mt-auto pt-1">
          <div ref={nutritionRef} className={cn('cq-nutrition text-xs', showBju && 'show-bju')}>
            {typeof nutrition.itemsCount === 'number' && (
              <div className="flex items-center gap-1">
                <Hash className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="font-medium text-muted-foreground">{nutrition.itemsCount}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500 flex-shrink-0" />
              <span className="font-semibold text-orange-600/90">
                {Math.round(nutrition.calories)}
              </span>
            </div>

            <div className="bju items-center gap-1">
              <Beef className="w-3 h-3 text-blue-500 flex-shrink-0" />
              <span className="font-medium text-blue-600/90">
                {Math.round(nutrition.proteins * 10) / 10}
              </span>
            </div>

            <div className="bju items-center gap-1">
              <Droplet className="w-3 h-3 text-yellow-500 flex-shrink-0" />
              <span className="font-medium text-yellow-600/90">
                {Math.round(nutrition.fats * 10) / 10}
              </span>
            </div>

            <div className="bju items-center gap-1">
              <Wheat className="w-3 h-3 text-green-500 flex-shrink-0" />
              <span className="font-medium text-green-600/90">
                {Math.round(nutrition.carbs * 10) / 10}
              </span>
            </div>

            <div className="flex items-center gap-1 ml-auto">
              <Weight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <span className="font-medium text-muted-foreground">
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
      <Link to={linkTo} ref={cardRef} className={cn(cardClasses, 'cq-card')}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div ref={cardRef} className={cn(cardClasses, 'cq-card')} {...interactiveProps}>
      {cardContent}
    </div>
  );
};

export default EntityCard;
