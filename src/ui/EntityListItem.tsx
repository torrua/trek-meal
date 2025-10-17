// src/ui/EntityListItem.tsx

import React from 'react';
import cn from 'classnames';
import type { MenuItem } from './EntityCard';

interface EntityListItemProps {
  title: string;
  icon: React.ElementType;
  details?: (string | React.ReactNode)[];
  menuItems?: MenuItem[];
  onClick?: () => void;
  borderColor?: string;
  tag?: {
    text: string;
    color?: string;
  };
  'data-testid'?: string;
}

const EntityListItem: React.FC<EntityListItemProps> = ({
  title,
  icon: Icon,
  details,
  menuItems,
  onClick,
  borderColor,
  tag,
  'data-testid': testId,
}) => {
  const hasMenu = menuItems && menuItems.length > 0;

  return (
    <div
      data-testid={testId}
      onClick={onClick}
      className={cn(
        // Base styling with Notion-style hover effects
        'group relative rounded-lg border transition-all duration-150',
        'bg-card border-border hover:bg-card-hover hover:border-border-hover',

        // Interactive states
        onClick && 'cursor-pointer',

        // Padding
        'p-3'
      )}
      style={{
        borderLeftWidth: borderColor ? '3px' : undefined,
        borderLeftColor: borderColor || undefined,
      }}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="flex items-center gap-3 min-h-[1.5rem]">
        {/* Icon */}
        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-muted/60 border border-border flex items-center justify-center">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Title and Tag */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <h3 className="text-sm font-medium text-foreground truncate">{title}</h3>

          {/* Tag */}
          {tag && (
            <span
              className="px-2 py-0.5 text-[11px] font-medium rounded-full flex-shrink-0"
              style={{
                backgroundColor: tag.color || '#3b82f6',
                color: '#ffffff',
              }}
            >
              {tag.text}
            </span>
          )}
        </div>

        {/* Details */}
        {details && details.length > 0 && (
          <div className="hidden sm:flex items-center gap-3 text-[12px] text-muted-foreground flex-shrink-0">
            {details.map((detail, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-muted-foreground/40 select-none">•</span>}
                <div className="font-medium">{detail}</div>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Action Menu */}
        {hasMenu && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 flex-shrink-0">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!item.disabled) {
                    item.onClick(e);
                  }
                }}
                disabled={item.disabled}
                className={cn(
                  'p-1.5 rounded-md transition-all duration-200',
                  'hover:bg-muted/60 active:scale-95',
                  item.disabled && 'opacity-50 cursor-not-allowed',
                  item.className
                    ? 'text-danger hover:bg-danger/10'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title={item.label}
                aria-label={item.label}
              >
                <item.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntityListItem;
