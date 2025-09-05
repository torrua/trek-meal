// src/ui/CompactCard.tsx

import React from 'react';
import cn from 'classnames';
import { MoreVertical } from 'lucide-react';
import DropdownMenu from './DropdownMenu';
import type { MenuItem } from './EntityCard'; // Re-using type

interface CompactCardProps {
  title: string;
  icon: React.ElementType;
  details: string;
  menuItems?: MenuItem[];
  onClick?: () => void;
  borderColor?: string;
  tag?: {
    text: string;
    color?: string;
  };
}

const CompactCard: React.FC<CompactCardProps> = ({
  title,
  icon: Icon,
  details,
  menuItems,
  onClick,
  borderColor,
  tag,
}) => {
  const hasMenu = menuItems && menuItems.length > 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative bg-card border rounded-lg shadow-sm flex justify-between items-center transition-all duration-200',
        'border-l-4',
        onClick && 'cursor-pointer hover:shadow-md hover:border-border-hover',
        borderColor ? `border-l-[${borderColor}]` : 'border-l-transparent'
      )}
      style={{ borderLeftColor: borderColor }}
    >
      <div className="flex items-center gap-3 p-3 min-w-0">
        <div className="text-muted-foreground">
          <Icon className="w-5 h-5 flex-shrink-0" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-foreground text-sm truncate">{title}</h4>
          <p className="text-xs text-muted-foreground truncate">{details}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 pr-3 flex-shrink-0">
        {tag && (
          <span
            className="px-2 py-0.5 text-xs font-medium text-white rounded-full"
            style={{ backgroundColor: tag.color || 'hsl(var(--primary))' }}
          >
            {tag.text}
          </span>
        )}
        {hasMenu && (
          <div className="z-10 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
            <DropdownMenu
              trigger={
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-full hover:bg-muted"
                >
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              }
            >
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    item.onClick();
                  }}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2',
                    item.className || 'text-card-foreground'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompactCard;
