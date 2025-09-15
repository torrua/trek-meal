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
        'group relative bg-muted dark:bg-dark-tertiary rounded-notion-md border border-l-4 px-3 py-2 transition-all duration-200 hover:shadow-notion-sm hover:border-border/70',
        onClick && 'cursor-pointer'
      )}
      style={{ borderLeftColor: borderColor || 'var(--border)' }}
    >
      <div className="flex items-center justify-between">
        {/* Левая часть: Иконка, Заголовок, Тег */}
        <div className="flex items-center gap-x-2 text-notion-sm min-w-0">
          <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <h3 className="font-semibold text-foreground truncate">{title}</h3>
          {tag && (
            <span
              className="px-1.5 py-0.5 text-white text-notion-xs rounded-full"
              style={{ backgroundColor: tag.color }}
            >
              {tag.text}
            </span>
          )}
        </div>

        {/* Правая часть: Детали и контекстное меню */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-x-2 text-notion-sm text-muted-foreground">
            {details?.map((detail, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-muted-foreground/50">•</span>}
                <div>{detail}</div>
              </React.Fragment>
            ))}
          </div>

          {hasMenu && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!item.disabled) item.onClick();
                  }}
                  disabled={item.disabled}
                  className={cn(
                    'p-1 rounded-notion-sm transition-colors',
                    item.className ? 'hover:bg-danger/10' : 'hover:bg-muted-foreground/10'
                  )}
                  title={item.label}
                  aria-label={item.label}
                >
                  <item.icon
                    className={cn(
                      'w-4 h-4',
                      item.className ? 'text-danger' : 'text-muted-foreground'
                    )}
                  />
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
