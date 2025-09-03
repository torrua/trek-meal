// src/components/categories/CategoryDetail.tsx

import React from 'react';
import { Tag, Edit, Package } from 'lucide-react';
import type { Category, Product } from '../../types';
import useProductStore from '../../stores/useProductStore';
import ProductCard from '../products/ProductCard';

interface CategoryDetailProps {
  category: Category | null;
  onEdit: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (e: React.MouseEvent, product: Product) => void;
}

const CategoryDetail: React.FC<CategoryDetailProps> = ({
  category,
  onEdit,
  onEditProduct,
  onDeleteProduct,
}) => {
  const { products } = useProductStore();

  if (!category) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Tag className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Выберите категорию
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Кликните на карточку для просмотра информации.
          </p>
        </div>
      </div>
    );
  }

  const categoryProducts = products.filter((p) => p.categoryId === category.id);

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <span
            className="w-8 h-8 rounded-full flex-shrink-0"
            style={{ backgroundColor: category.color }}
          />
          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: category.color }}>
            {category.emoji} {category.name}
          </h2>
        </div>
        <button
          onClick={onEdit}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          title="Редактировать категорию"
        >
          <Edit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6">
        <h3 className="font-semibold mb-3">
          Продукты в этой категории ({categoryProducts.length}):
        </h3>
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onEdit={() => onEditProduct(p)}
                onDelete={(e) => onDeleteProduct(e, p)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>В этой категории пока нет продуктов.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDetail;
