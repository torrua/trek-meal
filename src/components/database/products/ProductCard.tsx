// src/components/database/products/ProductCard.tsx

import React from 'react';
import cn from 'classnames';
import { Component, Edit, Trash2 } from 'lucide-react';
import type { Product, Category } from '../../../types';
import useCategoryStore from '../../../stores/useCategoryStore';

interface ProductCardProps {
  product: Product;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const { categories } = useCategoryStore();
  const category = categories.find((c: Category) => c.id === product.categoryId);

  return (
    <div
      onClick={onSelect}
      className={cn(
        'group relative bg-white dark:bg-gray-800 rounded-lg border transition-all duration-200 hover:shadow-lg',
        onSelect ? 'cursor-pointer' : 'cursor-default',
        isSelected
          ? 'border-blue-400 shadow-blue-100 dark:shadow-blue-900/20 shadow-lg ring-1 ring-blue-400/30 dark:ring-blue-500/30'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
        category && category.color && 'border-l-4'
      )}
      style={{ borderLeftColor: category && category.color ? category.color : 'transparent' }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <Component className="w-5 h-5 text-gray-500" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{product.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {product.calories} ккал / 100г
            </p>
          </div>
        </div>
      </div>
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Редактировать"
          >
            <Edit className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors"
            title="Удалить"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
