// src/components/equipment/EquipmentFiltersComponent.tsx

import React from 'react';
import { Tag, User, Users, RotateCcw } from 'lucide-react';
import useEquipmentCategoryStore from '../../stores/useEquipmentCategoryStore';
import DropdownSelect from '../../ui/DropdownSelect';

export interface EquipmentFilters {
  categoryId: 'all' | string;
  type: 'all' | 'personal' | 'common';
}

interface EquipmentFiltersProps {
  filters: EquipmentFilters;
  onFiltersChange: (filters: EquipmentFilters) => void;
}

const EquipmentFiltersComponent: React.FC<EquipmentFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const { categories } = useEquipmentCategoryStore();

  const handleFilterChange = (filterKey: keyof EquipmentFilters, value: string) => {
    onFiltersChange({ ...filters, [filterKey]: value });
  };

  const handleReset = () => {
    onFiltersChange({ categoryId: 'all', type: 'all' });
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== 'all');
  const activeFiltersCount = Object.values(filters).filter((value) => value !== 'all').length;

  // Category options with equipment category emojis
  const categoryOptions = [
    { value: 'all', label: 'Все категории' },
    ...categories.map((cat) => ({
      value: String(cat.id),
      label: cat.name,
      icon: () => <span className="text-lg">{cat.emoji}</span>,
    })),
  ];

  // Type options
  const typeOptions = [
    { value: 'all', label: 'Все типы' },
    {
      value: 'personal',
      label: 'Личное',
      icon: () => <User className="w-4 h-4" />,
    },
    {
      value: 'common',
      label: 'Общее',
      icon: () => <Users className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold text-gray-900 dark:text-white">Фильтры</span>
          {hasActiveFilters && (
            <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-800">
              {activeFiltersCount} активных
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors self-start sm:self-auto px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="font-medium">Сбросить все</span>
          </button>
        )}
      </div>

      {/* Filter dropdowns using Flexbox layout */}
      <div className="flex flex-wrap items-center gap-4">
        <DropdownSelect
          label="Категория"
          icon={Tag}
          options={categoryOptions}
          value={filters.categoryId}
          onChange={(value) => handleFilterChange('categoryId', value)}
          isActive={filters.categoryId !== 'all'}
        />
        <DropdownSelect
          label="Тип"
          icon={User}
          options={typeOptions}
          value={filters.type}
          onChange={(value) => handleFilterChange('type', value)}
          isActive={filters.type !== 'all'}
        />
      </div>
    </div>
  );
};

export default EquipmentFiltersComponent;
