// src/components/dishes/DishCard.tsx

import React, { useMemo } from 'react';
import useProductStore from '../../stores/useProductStore';
import type { Dish, Product } from '../../types';

interface DishCardProps {
  dish: Dish;
  onEdit: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const DishCard: React.FC<DishCardProps> = ({ dish, onEdit, onDelete }) => {
  const { products: allProducts } = useProductStore();

  // --- ИСПРАВЛЕНИЕ: Теперь мы используем allProducts для получения имен ---
  const dishContents = useMemo(() => {
    return dish.products.map((p) => {
      const product = allProducts.find((ap: Product) => ap.id === p.productId);
      return {
        name: product?.name || 'Неизвестный продукт',
        weight: p.weight,
      };
    });
  }, [dish.products, allProducts]);

  const totalWeight = dish.products.reduce((sum, p) => sum + p.weight, 0);

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
        <h3 className="text-lg font-bold text-gray-800 truncate" title={dish.name}>
          {dish.name}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {dish.products.length} комп. / {totalWeight} г
        </p>
      </div>

      {/* === BODY --- */}
      <div className="p-4 flex-grow">
        <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Состав:</h4>
        <ul className="space-y-1 list-disc pl-5 text-sm">
          {dishContents.map((item, index) => (
            <li key={index} className="flex justify-between">
              <span>{item.name}</span>
              <span className="font-medium text-gray-600">{item.weight} г</span>
            </li>
          ))}
        </ul>
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

export default DishCard;
