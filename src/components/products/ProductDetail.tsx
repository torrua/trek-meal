// src/components/products/ProductDetail.tsx

import React from 'react';
import { Package, Thermometer, Zap, Tag, Info, Edit, Apple, Beef, Carrot } from 'lucide-react';
import type { Product, Category } from '../../types';
import useCategoryStore from '../../stores/useCategoryStore';
import cn from 'classnames';

interface ProductDetailProps {
  product: Product | null;
  onEdit: () => void;
}

const StatCard = ({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  color: string;
}) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
    <Icon className={cn('w-5 h-5 mt-0.5', color)} />
    <div>
      <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
      <p className="text-base text-gray-600 dark:text-gray-300">{value}</p>
    </div>
  </div>
);

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onEdit }) => {
  const { categories } = useCategoryStore();

  if (!product) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Выберите продукт
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Кликните на карточку для просмотра подробной информации.
          </p>
        </div>
      </div>
    );
  }

  const category = categories.find((c: Category) => c.id === product.categoryId);

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {product.name}
          </h2>
          {category && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-400" />
              <span className="font-semibold text-sm" style={{ color: category.color }}>
                {category.emoji} {category.name}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onEdit}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          title="Редактировать продукт"
        >
          <Edit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6">
        <div>
          <h3 className="font-semibold mb-3">Пищевая ценность (на 100г)</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={Zap} value={product.calories} label="Калории" color="text-yellow-500" />
            <StatCard
              icon={Beef}
              value={`${product.proteins} г`}
              label="Белки"
              color="text-red-500"
            />
            <StatCard
              icon={Apple}
              value={`${product.fats} г`}
              label="Жиры"
              color="text-amber-500"
            />
            <StatCard
              icon={Carrot}
              value={`${product.carbs} г`}
              label="Углеводы"
              color="text-orange-500"
            />
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Порции</h3>
          <div className="space-y-2">
            {product.portions.map((portion, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <span className="font-medium text-gray-700 dark:text-gray-300">{portion.name}</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {portion.weight} г
                </span>
              </div>
            ))}
          </div>
        </div>

        {product.isPerishable && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <Thermometer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Скоропортящийся продукт
            </span>
          </div>
        )}

        {product.description && (
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Заметки
            </h3>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
