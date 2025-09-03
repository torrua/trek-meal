// src/components/database/dishes/DishDetail.tsx

import React from 'react';
import { Utensils, Edit } from 'lucide-react';
import type { Dish } from '../../../types';
import useProductStore from '../../../stores/useProductStore';

interface DishDetailProps {
  dish: Dish | null;
  onEdit: () => void;
}

const DishDetail: React.FC<DishDetailProps> = ({ dish, onEdit }) => {
  const { products: allProducts } = useProductStore();

  if (!dish) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Utensils className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Выберите блюдо</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Кликните на карточку для просмотра состава.
          </p>
        </div>
      </div>
    );
  }

  const totalWeight = dish.products.reduce((sum, p) => sum + p.weight, 0);

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {dish.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Общий вес: {totalWeight} г</p>
        </div>
        <button
          onClick={onEdit}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          title="Редактировать блюдо"
        >
          <Edit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6">
        <h3 className="font-semibold mb-3">Состав блюда:</h3>
        <ul className="space-y-2">
          {dish.products.map((p, index) => {
            const product = allProducts.find((ap) => ap.id === p.productId);
            return (
              <li
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {product?.name || 'Неизвестный продукт'}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">{p.weight} г</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default DishDetail;
