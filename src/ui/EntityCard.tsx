// src/ui/EntityCard.tsx

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import cn from 'classnames';
import {
  MoreHorizontal,
  Check,
  Flame,
  Beef,
  Droplet,
  Wheat,
  Weight,
  Hash,
  PieChart,
} from 'lucide-react';
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
  className?: string;
  'data-testid'?: string;
  linkTo?: string;
  description?: string;
  showMultiSelect?: boolean;
  variant?: 'neutral' | 'meal' | 'info' | 'composition' | 'dish' | 'product' | 'meal-type';
  nutrition?: {
    calories: number;
    proteins: number;
    fats: number;
    carbs: number;
    weight?: number;
    itemsCount?: number;
    portionCount?: number;
  };
  viewMode?: 'default' | 'compact';
}

let globalShowBjuCard = true;
const cardListeners = new Set<(show: boolean) => void>();

const subscribeToShowBjuCard = (callback: (show: boolean) => void) => {
  cardListeners.add(callback);
  return () => {
    cardListeners.delete(callback);
  };
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
  const measureTimeoutRef = useRef<number | undefined>(undefined);
  const clickTimeoutRef = useRef<number | null>(null);
  const clickCountRef = useRef(0);

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

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        window.clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    clickCountRef.current++;

    if (clickCountRef.current === 1) {
      // Set a timeout to handle single click
      clickTimeoutRef.current = window.setTimeout(() => {
        if (clickCountRef.current === 1) {
          // This was a single click
          if (showMultiSelect && onMultiSelect) {
            onMultiSelect(!isMultiSelected);
          } else {
            onSelect?.();
          }
        }
        clickCountRef.current = 0;
        if (clickTimeoutRef.current) {
          window.clearTimeout(clickTimeoutRef.current);
          clickTimeoutRef.current = null;
        }
      }, 300); // 300ms delay to detect double-click
    } else if (clickCountRef.current === 2) {
      // This is a double-click
      if (clickTimeoutRef.current) {
        window.clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      onRequestMultiSelectMode?.();
      clickCountRef.current = 0;
    }
  };

  const handleIconDoubleClick = (e: React.MouseEvent) => {
    // Prevent the card click handler from firing
    e.preventDefault();
    e.stopPropagation();
    onRequestMultiSelectMode?.();
  };

  const gradientByVariant: Record<NonNullable<EntityCardProps['variant']>, string> = {
    neutral: 'bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5',
    info: 'bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5',
    composition: '[background:var(--color-meal-composition-gradient)]',
    meal: '[background:var(--color-meal-composition-gradient)]',
    'meal-type': '[background:var(--color-meal-type-gradient)]',
    dish: '[background:var(--color-dish-gradient)]',
    product: '[background:var(--color-product-gradient)]',
  };

  const cardClasses = cn(
    'group relative flex flex-col rounded-xl p-4 cursor-pointer bg-card',
    gradientByVariant[variant],
    {
      'border border-border': !isSelected,
      'shadow-md ring-2 ring-primary/20': isSelected,
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
              {typeof Icon === 'function' ? (
                <Icon />
              ) : (
                <Icon
                  className={`h-4 w-4 ${variant === 'meal' ? 'text-green-600' : variant === 'meal-type' ? 'text-purple-600' : 'text-primary'}`}
                />
              )}
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
          // ИСПРАВЛЕНО: Убран отрицательный отступ справа (-mr-2),
          // чтобы кнопка была симметрична иконке слева относительно границ паддинга карточки
          <div className="flex-shrink-0">
            <DropdownMenu
              items={menuItems}
              trigger={
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
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
        <div className="mt-auto">
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
        <div className="mt-3">
          <div ref={nutritionRef} className={cn('cq-nutrition text-xs', showBju && 'show-bju')}>
            {typeof nutrition.itemsCount === 'number' && (
              <div className="flex items-center gap-0.5">
                <Hash className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="font-medium text-muted-foreground">{nutrition.itemsCount}</span>
              </div>
            )}

            <div className="flex items-center gap-0.5">
              <Flame className="w-3 h-3 text-orange-500 flex-shrink-0" />
              <span className="font-semibold text-orange-600">
                {Math.round(nutrition.calories)}
              </span>
            </div>

            <div className="bju items-center gap-0.5">
              <Beef className="w-3 h-3 text-blue-500 flex-shrink-0" />
              <span className="font-medium text-blue-600">
                {Math.round(nutrition.proteins * 10) / 10}
              </span>
            </div>

            <div className="bju items-center gap-0.5">
              <Droplet className="w-3 h-3 text-yellow-500 flex-shrink-0" />
              <span className="font-medium text-yellow-600">
                {Math.round(nutrition.fats * 10) / 10}
              </span>
            </div>

            <div className="bju items-center gap-0.5">
              <Wheat className="w-3 h-3 text-green-500 flex-shrink-0" />
              <span className="font-medium text-green-600">
                {Math.round(nutrition.carbs * 10) / 10}
              </span>
            </div>

            {/* 1. Если передан вес (Блюда, Приемы пищи) */}
            {typeof nutrition.weight === 'number' && (
              <div className="flex items-center gap-0.5 ml-auto" title="Общий вес">
                <span className="font-medium text-muted-foreground">
                  {Math.round(nutrition.weight)}
                </span>
                <Weight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              </div>
            )}

            {/* 2. Если переданы порции (Продукты), но нет веса */}
            {typeof nutrition.weight === 'undefined' &&
              typeof nutrition.portionCount === 'number' && (
                <div className="flex items-center gap-0.5 ml-auto" title="Вариантов порций">
                  <span className="font-medium text-muted-foreground">
                    {nutrition.portionCount}
                  </span>
                  <PieChart className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                </div>
              )}
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
    onDoubleClick: (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onRequestMultiSelectMode?.();
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
      <Link to={linkTo} className={cn(cardClasses, 'cq-card')}>
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
