// src/components/products/ProductFiltersComponent.tsx

import React, { useMemo, useCallback } from 'react';
import useCategoryStore from '../../stores/useCategoryStore';
import type { Category } from '../../types';
import FiltersPanel from '../../ui/filters/FiltersPanel';

export interface ProductFilters {
  categoryIds: string[];
}

interface ProductFiltersComponentProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
}

interface CategoryOption {
  value: string;
  label: string;
}

const ProductFiltersComponent: React.FC<ProductFiltersComponentProps> = ({
  filters,
  onFiltersChange,
}) => {
  const { categories } = useCategoryStore();

  const categoryOptions: CategoryOption[] = useMemo(
    () => categories.map((cat: Category) => ({ value: String(cat.id), label: cat.name })),
    [categories]
  );

  const handlePanelChange = useCallback(
    (next: Partial<ProductFilters>) => onFiltersChange({ ...filters, ...next }),
    [filters, onFiltersChange]
  );

  const fields = useMemo(
    () => [
      {
        type: 'multiselect' as const,
        name: 'categoryIds',
        label: 'Категории',
        options: categoryOptions,
      },
    ],
    [categoryOptions]
  );

  return <FiltersPanel values={filters} onChange={handlePanelChange} fields={fields} />;
};

export default ProductFiltersComponent;
