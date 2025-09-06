// src/components/products/ProductListItem.tsx

import React from 'react';
import cn from 'classnames';
import { Package, Edit, Trash2, ExternalLink, Flame, Dna } from 'lucide-react';
import type { Product } from '../../types';

interface ProductListItemProps {
  product: Product;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  borderColor?: string;
}

const ProductListItem: React.FC<ProductListItemProps> = ({
  product,
  onView,
  onEdit,
  onDelete,
  borderColor = '#6b7280', // gray-500 default
}) => {
  return (
    <div
      className={cn(
        'group relative bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-l-4 px-3 py-2 transition-all duration-200 hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer'
      )}
      style={{ borderLeftColor: borderColor }}
      onClick={onView}
      data-testid={`product-${product.id}`}
    >
      {/* One-line layout with justify-between */}
      <div className="flex items-center justify-between">
        {/* Left section: Package • Product Name */}
        <div className="flex items-center gap-x-1.5 text-sm min-w-0">
          <div title="Продукт">
            <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <span className="text-gray-400 dark:text-gray-500 text-xs select-none">•</span>
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{product.name}</h3>
        </div>

        {/* Right section: Calories • Nutrition + context menu */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-x-1.5 text-sm">
            <div
              className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"
              title="Калорийность на 100г"
            >
              <Flame className="w-4 h-4" />
              <span className="font-medium">{product.calories} ккал</span>
            </div>
            {(product.proteins || product.fats || product.carbs) && (
              <>
                <span className="text-gray-400 dark:text-gray-500 text-xs select-none">•</span>
                <div
                  className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"
                  title="Белки, жиры, углеводы на 100г"
                >
                  <Dna className="w-4 h-4" />
                  <span className="font-medium">
                    Б:{product.proteins || 0} Ж:{product.fats || 0} У:{product.carbs || 0}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Context menu buttons */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Открыть продукт"
              aria-label={`Открыть продукт ${product.name}`}
            >
              <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Редактировать продукт"
              aria-label={`Редактировать ${product.name}`}
            >
              <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition-colors"
              title="Удалить продукт"
              aria-label={`Удалить ${product.name}`}
            >
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListItem;
