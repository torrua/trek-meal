// src/components/dishes/DishCard.tsx

import React from 'react';
import useProductStore from '../../stores/useProductStore';
import type { Dish, Product } from '../../types';

interface DishCardProps {
  dish: Dish;
  onEdit: () => void;
  onDelete: () => void;
}

const DishCard: React.FC<DishCardProps> = ({ dish, onEdit, onDelete }) => {
  const { products } = useProductStore();

  // Находим полные данные о продуктах в блюде
  const dishProducts = dish.products.map(dp => {
    const product = products.find((p: Product) => p.id === dp.productId);
    return { ...dp, name: product?.name || 'Неизвестный продукт' };
  });

  const totalWeight = dish.products.reduce((sum, p) => sum + p.weight, 0);

  return (
    <div className="bg-white border rounded-lg shadow-sm flex flex-col transition-shadow hover:shadow-md">
      <div className="p-4 border-b">
        <h3 className="text-lg font-bold text-gray-800">{dish.name}</h3>
        <p className="text-sm text-gray-500">{dish.products.length} комп. / {totalWeight} г</p>
      </div>
      <div className="p-4 flex-grow">
        <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Состав:</h4>
        <ul className="space-y-1 list-disc pl-5">
          {dishProducts.map((dp, index) => (
            <li key={index} className="text-sm flex justify-between">
              <span>{dp.name}</span>
              <span className="font-medium text-gray-600">{dp.weight} г</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-3 bg-gray-50 border-t flex justify-end gap-2">
        <button onClick={onEdit} className="text-sm font-medium text-blue-600 hover:text-blue-800">Редактировать</button>
        <button onClick={onDelete} className="text-sm font-medium text-red-600 hover:text-red-800">Удалить</button>
      </div>
    </div>
  );
};

export default DishCard;
