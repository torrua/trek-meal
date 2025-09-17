// src/ui/EntityCard.tsx

import React from 'react';
import cn from 'classnames';
import { MoreHorizontal } from 'lucide-react';
import DropdownMenu from './DropdownMenu';

export interface MenuItem {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

interface DetailItem {
  key: string;
  icon: React.ElementType;
  text: string | number;
  title?: string;
  className?: string;
}

interface EntityCardProps {
  title: string;
  subtitle?: React.ReactNode;
  icon: React.ElementType;
  iconColor?: string;
  details: DetailItem[];
  menuItems: MenuItem[];
  isSelected: boolean;
  onSelect: () => void;
  borderColor?: string;
  className?: string;
  'data-testid'?: string;
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
  return (
    <div
      data-testid={testId}
      onClick={onSelect}
      className={cn(
        // Base Notion-style card
        'group relative bg-card rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden',
        'hover:notion-shadow hover:-translate-y-0.5',
        'notion-focus-ring',

        // Selection states with Notion-style colors
        isSelected
          ? 'border-primary/30 bg-primary/5 notion-shadow'
          : 'border notion-border-subtle hover:border-border/80',

        // Left border accent (Notion-style)
        'border-l-4',

        className
      )}
      style={{
        borderLeftColor: isSelected ? 'rgb(var(--primary))' : borderColor || 'rgb(var(--border))',
      }}
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
      {/* Notion-style floating menu button */}
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus-within:opacity-100">
        <DropdownMenu
          trigger={
            <button
              className={cn(
                'p-1.5 bg-card/80 backdrop-blur-sm rounded-lg border notion-border-subtle',
                'hover:bg-muted/80 text-muted-foreground hover:text-foreground',
                'notion-shadow-sm hover:notion-shadow transition-all duration-200',
                'notion-focus-ring'
              )}
              aria-label="Открыть меню действий"
            >
              <MoreHorizontal className="w-4 h-4" />
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
                'w-full px-3 py-2 text-left text-sm transition-all duration-150 flex items-center gap-3 rounded-md',
                'notion-bg-hover',
                item.disabled
                  ? 'text-muted-foreground/50 cursor-not-allowed'
                  : item.className || 'text-card-foreground hover:text-foreground'
              )}
              aria-label={item.label}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </DropdownMenu>
      </div>

      {/* Card Content */}
      <div className="p-5">
        <div className="space-y-4">
          {/* Header with icon and title */}
          <div className="flex items-start gap-3 pr-8">
            <div
              className={cn(
                'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                'bg-muted/50 border notion-border-subtle',
                iconColor || 'text-muted-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <h3
                className="font-semibold text-foreground text-base leading-tight truncate"
                title={title}
              >
                {title}
              </h3>
              {subtitle && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          {/* Details with Notion-style spacing */}
          {details.length > 0 && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {details.map((detail) => (
                <div
                  key={detail.key}
                  className={cn('flex items-center gap-2 min-w-0', detail.className)}
                  title={detail.title}
                >
                  <detail.icon className="w-4 h-4 flex-shrink-0 opacity-70" />
                  <span className="font-medium text-foreground/80 truncate">{detail.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notion-style selection indicator */}
      {isSelected && (
        <div className="absolute bottom-3 right-3">
          <div className="w-2 h-2 bg-primary rounded-full notion-shadow-sm"></div>
        </div>
      )}
    </div>
  );
};

export default EntityCard;
