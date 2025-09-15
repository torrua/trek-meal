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
        'group relative bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-l-4 px-3 py-2 transition-all duration-200 hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-600'
      )}
      style={{ borderLeftColor: '#6b7280' }} // gray-500 neutral border
      data-testid={`portion-${portion.name}`}
    >
      <div className="flex items-center justify-between">
        {/* Левая часть: Иконка и Название */}
        <div className="flex items-center gap-x-2 text-sm min-w-0">
          <Package className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{portion.name}</h3>
        </div>

        {/* Правая часть: Вес и кнопки действий */}
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
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
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Редактировать порцию"
              aria-label={`Редактировать порцию ${portion.name}`}
            >
              <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition-colors"
                title="Удалить порцию"
                aria-label={`Удалить порцию ${portion.name}`}
              >
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortionListItem;
