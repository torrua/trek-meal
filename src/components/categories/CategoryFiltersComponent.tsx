// src/components/database/categories/CategoryFiltersComponent.tsx

import React from 'react';
import { Filter } from 'lucide-react';

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
  const handleFilterChange = (key: keyof CategoryFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Filter className="w-4 h-4" />
        <span>Фильтры</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Наличие продуктов
          </label>
          <select
            value={filters.hasProducts}
            onChange={(e) => handleFilterChange('hasProducts', e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Все категории</option>
            <option value="with_products">С продуктами</option>
            <option value="without_products">Без продуктов</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default CategoryFiltersComponent;
