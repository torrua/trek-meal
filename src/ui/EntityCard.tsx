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
}

// Глобальное состояние для синхронизации всех карточек
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

  // Подписываемся на глобальные изменения
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
        // Проверяем, помещается ли полная версия с БЖУ
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
      if (measureTimeoutRef.current) {
        window.clearTimeout(measureTimeoutRef.current);
      }
    };
  }, [nutrition]);

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
      'border-primary/50 bg-primary/10 hover:bg-primary/15 hover:border-primary/60': isSelected,
      'hover:bg-card-hover hover:border-border-hover': !isSelected,
    },
    className
  );

  const cardContent = (
    <>
      <div className="flex items-start justify-between gap-2">
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
                {isMultiSelected && <Check className="h-4 w-4" />}
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
          <div ref={nutritionRef} className={cn('cq-nutrition text-sm', showBju && 'show-bju')}>
            {typeof nutrition.itemsCount === 'number' && (
              <div className="flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="font-semibold text-muted-foreground">{nutrition.itemsCount}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
              <span className="font-semibold text-orange-600">
                {Math.round(nutrition.calories)}
              </span>
            </div>

            <div className="bju items-center gap-1">
              <Beef className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span className="font-semibold text-blue-600">
                {Math.round(nutrition.proteins * 10) / 10}
              </span>
            </div>

            <div className="bju items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0" />
              <span className="font-semibold text-yellow-600">
                {Math.round(nutrition.fats * 10) / 10}
              </span>
            </div>

            <div className="bju items-center gap-1">
              <Wheat className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
              <span className="font-semibold text-green-600">
                {Math.round(nutrition.carbs * 10) / 10}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Weight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
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
