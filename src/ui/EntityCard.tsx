// src/ui/EntityCard.tsx

import React from 'react';
import cn from 'classnames';
import { MoreVertical } from 'lucide-react';
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
  const effectiveBorderColor = borderColor || 'var(--border)';

  return (
    <div
      data-testid={testId}
      onClick={onSelect}
      className={cn(
        'group relative bg-card rounded-notion-md border transition-colors duration-200 cursor-pointer',
        'border-l-4',
        isSelected ? 'bg-muted border-primary' : 'hover:bg-muted/50',
        className
      )}
      style={{
        borderLeftColor: isSelected ? 'var(--primary)' : effectiveBorderColor,
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
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
        <DropdownMenu
          trigger={
            <button
              className="p-1.5 bg-card rounded-notion-sm hover:bg-muted text-muted-foreground"
              aria-label="Открыть меню действий"
            >
              <MoreVertical className="w-4 h-4" />
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
                'w-full px-3 py-2 text-left text-notion-sm hover:bg-muted transition-colors flex items-center gap-2',
                item.disabled
                  ? 'text-muted-foreground/50 cursor-not-allowed'
                  : item.className || 'text-foreground'
              )}
              aria-label={item.label}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </DropdownMenu>
      </div>

      <div className="p-4">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-2 pr-8">
            <div className={cn('flex-shrink-0', iconColor || 'text-muted-foreground')}>
              <Icon className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-foreground truncate" title={title}>
              {title}
            </h3>
          </div>

          <div className="flex items-center justify-between">
            {details.length > 0 && (
              <div className="flex items-center gap-3 text-notion-sm text-muted-foreground flex-wrap">
                {details.map((detail, index) => (
                  <React.Fragment key={detail.key}>
                    {index > 0 && (
                      <span className="text-muted-foreground/50 text-notion-xs select-none">•</span>
                    )}
                    <div
                      className={cn('flex items-center gap-1.5', detail.className)}
                      title={detail.title}
                    >
                      <detail.icon className="w-4 h-4 flex-shrink-0" />
                      {detail.text && <span className="font-medium">{detail.text}</span>}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}

            {subtitle && (
              <div className="flex items-center gap-1 flex-shrink-0 text-notion-sm text-muted-foreground ml-auto">
                {subtitle}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntityCard;
