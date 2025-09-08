// src/components/equipment/EquipmentListItem.tsx

import React from 'react';
import cn from 'classnames';
import { Backpack, Edit, Trash2, ExternalLink, Scale, User, Users } from 'lucide-react';
import type { Equipment } from '../../types';

interface EquipmentListItemProps {
  equipment: Equipment;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  borderColor?: string;
}

const EquipmentListItem: React.FC<EquipmentListItemProps> = ({
  equipment,
  onView,
  onEdit,
  onDelete,
  borderColor = '#6b7280', // gray-500 default
}) => {
  const formatWeight = (weight: number) => {
    if (weight < 1000) {
      return `${weight} г`;
    }
    return `${(weight / 1000).toFixed(1)} кг`;
  };

  const getTypeIcon = () => {
    return equipment.type === 'personal' ? User : Users;
  };

  const getTypeLabel = () => {
    return equipment.type === 'personal' ? 'Личное' : 'Общее';
  };

  const TypeIcon = getTypeIcon();

  return (
    <div
      className={cn(
        'group relative bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-l-4 px-3 py-2 transition-all duration-200 hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer'
      )}
      style={{ borderLeftColor: borderColor }}
      onClick={onView}
      data-testid={`equipment-${equipment.id}`}
    >
      {/* One-line layout with justify-between */}
      <div className="flex items-center justify-between">
        {/* Left section: Backpack • Equipment Name */}
        <div className="flex items-center gap-x-1.5 text-sm min-w-0">
          <div title="Снаряжение">
            <Backpack className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <span className="text-gray-400 dark:text-gray-500 text-xs select-none">•</span>
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{equipment.name}</h3>
        </div>

        {/* Right section: Weight • Type + context menu */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-x-1.5 text-sm">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400" title="Вес">
              <Scale className="w-4 h-4" />
              <span className="font-medium">{formatWeight(equipment.weight)}</span>
            </div>
            <span className="text-gray-400 dark:text-gray-500 text-xs select-none">•</span>
            <div
              className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"
              title="Тип снаряжения"
            >
              <TypeIcon className="w-4 h-4" />
              <span className="font-medium">{getTypeLabel()}</span>
            </div>
          </div>

          {/* Context menu buttons */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Открыть снаряжение"
              aria-label={`Открыть снаряжение ${equipment.name}`}
            >
              <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Редактировать снаряжение"
              aria-label={`Редактировать ${equipment.name}`}
            >
              <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition-colors"
              title="Удалить снаряжение"
              aria-label={`Удалить ${equipment.name}`}
            >
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentListItem;
