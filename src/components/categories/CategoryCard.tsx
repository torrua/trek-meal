// src/components/categories/CategoryCard.tsx

import React, { useMemo } from 'react';
import useProductStore from '../../stores/useProductStore';
import type { Category, Product } from '../../types';

interface CategoryCardProps {
  category: Category;
  onEdit: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onEdit, onDelete }) => {
  const { products } = useProductStore();

  const productCount = useMemo(
    () => products.filter((p: Product) => p.categoryId === category.id).length,
    [products, category.id]
  );

  const handleCardClick = () => onEdit();
  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(e);
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col transition-shadow hover:shadow-md cursor-pointer"
      onClick={handleCardClick}
    >
      {/* === HEADER === */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        <span
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: category.color }}
        />
        <h3 className="text-lg font-bold text-gray-800 truncate" title={category.name}>
          {category.emoji} {category.name}
        </h3>
      </div>

      {/* === BODY === */}
      <div className="p-4 flex-grow flex flex-col items-center justify-center text-center">
        <div className="text-5xl font-bold text-gray-800">{productCount}</div>
        <div className="text-sm text-gray-500 uppercase">
          {productCount === 1
            ? 'продукт'
            : productCount > 1 && productCount < 5
              ? 'продукта'
              : 'продуктов'}
        </div>
      </div>

      {/* === FOOTER === */}
      <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
        <button
          onClick={(e) => handleButtonClick(e, onEdit)}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Редактировать
        </button>
        <button
          onClick={handleDeleteClick}
          className="text-sm font-medium text-red-600 hover:text-red-800"
        >
          Удалить
        </button>
      </div>
    </div>
  );
};

export default CategoryCard;
