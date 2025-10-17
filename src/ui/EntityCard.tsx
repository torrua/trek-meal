// src/ui/EntityCard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import cn from 'classnames';
import { MoreHorizontal, Check } from 'lucide-react';
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
}

const EntityCard: React.FC<EntityCardProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  details,
  menuItems,
  isSelected,
  isMultiSelected,
  onSelect,
  onMultiSelect,
  borderColor,
  className,
  'data-testid': testId,
  linkTo,
  description,
  showMultiSelect = false,
}) => {
  const cardClasses = cn(
    // Base styles with refined Notion aesthetics
    'block p-4 rounded-xl border transition-all duration-200 cursor-pointer relative',
    'notion-shadow-xs hover:notion-shadow-sm',
    // Selected state
    {
      'border-primary/40 bg-primary/5 hover:bg-primary/8 hover:border-primary/60 notion-shadow-sm':
        isSelected,
      'border-border bg-card hover:bg-card-hover hover:border-border-hover': !isSelected,
    },
    // Custom border color
    borderColor && !isSelected ? `border-[${borderColor}]/20 hover:border-[${borderColor}]/40` : '',
    borderColor && isSelected ? `border-[${borderColor}]/50 hover:border-[${borderColor}]/70` : '',
    className
  );

  const cardContent = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {/* Multi-select checkbox */}
          {showMultiSelect && (
            <div className="flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onMultiSelect?.(!isMultiSelected);
                }}
                className={cn(
                  'flex items-center justify-center w-5 h-5 rounded border transition-all duration-200',
                  isMultiSelected
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-border bg-card hover:border-border-hover'
                )}
                aria-label={isMultiSelected ? 'Снять выделение' : 'Выделить'}
              >
                {isMultiSelected && <Check className="w-4 h-4" />}
              </button>
            </div>
          )}

          <div
            className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
              'transition-colors duration-200',
              'bg-primary/10'
            )}
            style={iconColor ? { backgroundColor: `${iconColor}1A` } : undefined}
          >
            {typeof Icon === 'function' ? (
              <Icon />
            ) : (
              <Icon
                className={cn('w-5 h-5', !iconColor && 'text-primary')}
                style={iconColor ? { color: iconColor } : undefined}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3
              className="text-base font-medium text-foreground truncate leading-snug"
              title={title}
            >
              {title}
            </h3>
            {subtitle && (
              <div className="text-sm text-muted-foreground mt-0.5 leading-snug">{subtitle}</div>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-1 truncate leading-relaxed">
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
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-all duration-200 notion-focus-ring"
                aria-label="More options"
              >
                <MoreHorizontal className="w-4 h-4" />
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
                <item.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <dt className="sr-only">{item.key}</dt>
                <dd className={cn('text-foreground/90 truncate font-medium', item.className)}>
                  {item.text}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </>
  );

  const interactiveProps = {
    onClick: (e: React.MouseEvent) => {
      if (showMultiSelect && e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        onMultiSelect?.(!isMultiSelected);
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

  const borderStyle = borderColor
    ? {
        borderLeft: `3px solid ${borderColor}`,
      }
    : {};

  if (linkTo) {
    return (
      <Link to={linkTo} className={cardClasses} style={borderStyle}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={cardClasses} style={borderStyle} {...interactiveProps}>
      {cardContent}
    </div>
  );
};

export default EntityCard;
