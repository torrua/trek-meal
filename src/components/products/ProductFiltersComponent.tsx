// src/components/products/ProductFiltersComponent.tsx

import React from 'react';
import { Tag, RotateCcw } from 'lucide-react';
import useCategoryStore from '../../stores/useCategoryStore';
import type { Category } from '../../types';
import DropdownSelect from '../../ui/DropdownSelect';

export interface ProductFilters {
  categoryId: string; // 'all' or a category ID
}

interface ProductFiltersComponentProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
}

const ProductFiltersComponent: React.FC<ProductFiltersComponentProps> = ({
  filters,
  onFiltersChange,
}) => {
  const { categories } = useCategoryStore();

  const categoryOptions = [
    { value: 'all', label: 'Все категории' },
    ...categories.map((cat: Category) => ({
      value: String(cat.id),
      label: cat.name,
      icon: () => <span className="text-lg">{cat.emoji}</span>,
    })),
  ];

  const handleFilterChange = (filterKey: keyof ProductFilters, value: string) => {
    onFiltersChange({ ...filters, [filterKey]: value });
  };

  const handleReset = () => {
    onFiltersChange({ categoryId: 'all' });
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== 'all');

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
          label="Категория"
          icon={Tag}
          options={categoryOptions}
          value={filters.categoryId}
          onChange={(value) => handleFilterChange('categoryId', value)}
          isActive={filters.categoryId !== 'all'}
        />
      </div>
    </div>
  );
};

export default ProductFiltersComponent;
