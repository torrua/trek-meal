// src/components/products/ProductCard.tsx

import React from 'react';
import useCategoryStore from '../../stores/useCategoryStore';
import type { Product, Category } from '../../types';

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  const { categories } = useCategoryStore();
  const category = categories.find((c: Category) => c.id === product.categoryId);

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
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 truncate" title={product.name}>
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap h-5">
          {category && (
            <span
              className="px-2 py-0.5 text-xs font-medium text-white rounded-full"
              style={{ backgroundColor: category.color }}
            >
              {category.emoji} {category.name}
            </span>
          )}
          {product.isPerishable && (
            <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
              Скоропортящийся
            </span>
          )}
        </div>
      </div>

      {/* === BODY === */}
      <div className="p-4 flex-grow">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-xl font-bold text-blue-600">{product.calories}</div>
            <div className="text-xs text-gray-500">ккал</div>
          </div>
          <div>
            <div className="text-xl font-bold text-blue-600">{product.proteins}</div>
            <div className="text-xs text-gray-500">белки</div>
          </div>
          <div>
            <div className="text-xl font-bold text-blue-600">{product.fats}</div>
            <div className="text-xs text-gray-500">жиры</div>
          </div>
          <div>
            <div className="text-xl font-bold text-blue-600">{product.carbs}</div>
            <div className="text-xs text-gray-500">у/воды</div>
          </div>
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

export default ProductCard;
