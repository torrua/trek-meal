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
        'group relative bg-muted dark:bg-dark-tertiary rounded-notion-md border border-l-4 px-3 py-2 transition-all duration-200 hover:shadow-notion-sm hover:border-border/50 dark:hover:border-dark-border'
      )}
      style={{ borderLeftColor: 'var(--notion-blue)' }}
      data-testid={`portion-${portion.name}`}
    >
      <div className="flex items-center justify-between">
        {/* Левая часть: Иконка и Название */}
        <div className="flex items-center gap-x-2 text-notion-sm min-w-0">
          <Package className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <h3 className="font-medium text-foreground dark:text-white truncate">{portion.name}</h3>
        </div>

        {/* Правая часть: Вес и кнопки действий */}
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-1.5 text-notion-sm text-muted-foreground"
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
              className="p-1 hover:bg-muted-foreground/10 rounded-notion-sm transition-colors"
              title="Редактировать порцию"
              aria-label={`Редактировать порцию ${portion.name}`}
            >
              <Edit className="w-4 h-4 text-muted-foreground" />
            </button>
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 hover:bg-danger/10 rounded-notion-sm transition-colors"
                title="Удалить порцию"
                aria-label={`Удалить порцию ${portion.name}`}
              >
                <Trash2 className="w-4 h-4 text-danger" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortionListItem;
