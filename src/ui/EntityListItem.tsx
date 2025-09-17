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
        // Base Notion-style list item
        'group relative bg-card rounded-lg border notion-border-subtle border-l-4 transition-all duration-200',
        'hover:notion-shadow-sm hover:border-border hover:-translate-y-0.5',
        'notion-focus-ring',

        // Interactive states
        onClick && 'cursor-pointer notion-bg-hover',

        // Padding with Notion spacing
        'px-4 py-3'
      )}
      style={{
        borderLeftColor: borderColor || 'rgb(var(--border))',
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
      <div className="flex items-center justify-between min-h-[1.5rem]">
        {/* Left section: Icon, Title, Tag */}
        <div className="flex items-center gap-3 text-sm min-w-0 flex-1">
          {/* Icon with Notion-style background */}
          <div className="flex-shrink-0 w-6 h-6 rounded-md bg-muted/50 border notion-border-subtle flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
          </div>

          {/* Title */}
          <h3 className="font-semibold text-foreground truncate tracking-tight">{title}</h3>

          {/* Tag */}
          {tag && (
            <span
              className="px-2 py-0.5 text-white text-xs font-medium rounded-full flex-shrink-0"
              style={{ backgroundColor: tag.color || 'rgb(var(--primary))' }}
            >
              {tag.text}
            </span>
          )}
        </div>

        {/* Right section: Details and Menu */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Details */}
          {details && details.length > 0 && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {details.map((detail, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span className="text-border select-none">•</span>}
                  <div className="font-medium">{detail}</div>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Action Menu */}
          {hasMenu && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
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
                    'p-1.5 rounded-lg transition-all duration-200 notion-focus-ring',
                    'hover:bg-muted/60 active:scale-95',
                    item.disabled && 'opacity-50 cursor-not-allowed',
                    item.className
                      ? 'text-danger hover:bg-danger/10 hover:text-danger'
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
    </div>
  );
};

export default EntityListItem;
