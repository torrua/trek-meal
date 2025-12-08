// src/components/products/PortionListItem.tsx

import React from 'react';
import cn from 'classnames';
import { Package, Edit, Trash2, Scale } from 'lucide-react';

interface PortionListItemProps {
  portion: { name: string; weight: number };
  onEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

const PortionListItem: React.FC<PortionListItemProps> = ({
  portion,
  onEdit,
  onDelete,
  canDelete,
}) => {
  return (
    <div
      className={cn(
        // Base styling with Notion-style hover effects
        'group relative rounded-lg border transition-all duration-150',
        'bg-card border-border hover:bg-card-hover hover:border-border-hover',
        // Padding
        'p-3',
        // Blue left border
        'border-l-[3px] border-l-[var(--notion-blue)]'
      )}
      data-testid={`portion-${portion.name}`}
    >
      <div className="flex items-center gap-3 min-h-[1.5rem]">
        {/* Icon */}
        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-muted/60 border border-border flex items-center justify-center">
          <Package className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Title and Weight */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <h3 className="text-sm font-medium text-foreground truncate">{portion.name}</h3>
        </div>

        {/* Weight and buttons */}
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-1.5 text-[12px] text-muted-foreground"
            title="Вес порции"
          >
            <Scale className="w-4 h-4" />
            <span className="font-medium">{portion.weight} г</span>
          </div>

          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 rounded-md hover:bg-muted/60 active:scale-95 text-muted-foreground hover:text-foreground"
              title="Редактировать порцию"
              aria-label={`Редактировать порцию ${portion.name}`}
            >
              <Edit className="w-4 h-4" />
            </button>
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1.5 rounded-md hover:bg-danger/10 active:scale-95 text-danger"
                title="Удалить порцию"
                aria-label={`Удалить порцию ${portion.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortionListItem;
