// src/components/categories/CategoryFiltersComponent.tsx

import React from 'react';
import { Package, RotateCcw } from 'lucide-react';
import DropdownSelect from '../../ui/DropdownSelect';

export interface CategoryFilters {
  hasProducts: 'all' | 'with_products' | 'without_products';
}

interface CategoryFiltersComponentProps {
  filters: CategoryFilters;
  onFiltersChange: (filters: CategoryFilters) => void;
}

const CategoryFiltersComponent: React.FC<CategoryFiltersComponentProps> = ({
  filters,
  onFiltersChange,
}) => {
  const options = [
    { value: 'all', label: 'Все категории' },
    { value: 'with_products', label: 'С продуктами' },
    { value: 'without_products', label: 'Без продуктов' },
  ];

  const handleFilterChange = (key: keyof CategoryFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onFiltersChange({ hasProducts: 'all' });
  };

  const hasActiveFilters = filters.hasProducts !== 'all';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">Фильтры</span>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-danger transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Сбросить все</span>
          </button>
        )}
      </div>

      {/* --- ИЗМЕНЕНИЕ: Используем Flexbox вместо Grid --- */}
      <div className="flex flex-wrap items-center gap-4">
        <DropdownSelect
          label="Наличие продуктов"
          icon={Package}
          options={options}
          value={filters.hasProducts}
          onChange={(value) => handleFilterChange('hasProducts', value)}
          isActive={hasActiveFilters}
        />
      </div>
    </div>
  );
};

export default CategoryFiltersComponent;
