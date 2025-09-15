// src/components/products/ProductFiltersComponent.tsx

import React from 'react';
import { Tag, RotateCcw, X } from 'lucide-react';
import useCategoryStore from '../../stores/useCategoryStore';
import type { Category } from '../../types';
import ThemedSelect from '../../ui/ThemedSelect';

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
  emoji?: string;
  color?: string;
}

const ProductFiltersComponent: React.FC<ProductFiltersComponentProps> = ({
  filters,
  onFiltersChange,
}) => {
  const { categories } = useCategoryStore();

  const categoryOptions: CategoryOption[] = categories.map((cat: Category) => ({
    value: String(cat.id),
    label: cat.name,
    emoji: cat.emoji,
    color: cat.color,
  }));

  const handleCategoryChange = (selectedOptions: any) => {
    // selectedOptions будет null если ничего не выбрано
    const selectedIds = selectedOptions ? selectedOptions.map((opt: any) => opt.value) : [];
    onFiltersChange({ categoryIds: selectedIds });
  };

  const handleReset = () => {
    onFiltersChange({ categoryIds: [] });
  };

  const hasActiveFilters = filters.categoryIds.length > 0;

  // Форматируем выбранные значения для Select
  const selectedValues = categoryOptions.filter((opt) => filters.categoryIds.includes(opt.value));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-muted-foreground" />
          <span className="text-notion-sm font-medium text-foreground">Категории</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-notion-xs text-muted-foreground hover:text-danger transition-colors"
            title="Сбросить фильтры"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Сбросить</span>
          </button>
        )}
      </div>

      <ThemedSelect
        isMulti
        options={categoryOptions}
        value={selectedValues}
        onChange={handleCategoryChange}
        placeholder="Выберите категории..."
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        isClearable={false}
      />

      {/* Отображение выбранных фильтров чипами */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedValues.map((option) => (
            <div
              key={option.value}
              className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-notion-sm text-notion-xs"
            >
              {option.emoji && <span>{option.emoji}</span>}
              <span>{option.label}</span>
              <button
                onClick={() => {
                  const newCategoryIds = filters.categoryIds.filter((id) => id !== option.value);
                  onFiltersChange({ categoryIds: newCategoryIds });
                }}
                className="text-primary hover:text-danger"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductFiltersComponent;
