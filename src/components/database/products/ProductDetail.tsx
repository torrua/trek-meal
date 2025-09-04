// src/components/products/ProductDetail.tsx

import React, { useState } from 'react';
import {
  Package,
  Thermometer,
  Flame,
  Tag,
  Info,
  Edit,
  Puzzle,
  ChevronDown,
  Trash2,
  BarChart,
  PackagePlus,
} from 'lucide-react';
import type { Product, Category, ProductPortion } from '../../../types';
import useCategoryStore from '../../../stores/useCategoryStore';
import useProductStore from '../../../stores/useProductStore';
import cn from 'classnames';
import ConfirmModal from '../../../ui/ConfirmModal';

interface ProductDetailProps {
  product: Product | null;
  onEdit: () => void;
}

const AccordionSection: React.FC<{
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  actionButton?: React.ReactNode;
}> = ({ title, icon: Icon, isOpen, onToggle, children, actionButton }) => (
  <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
    <button
      onClick={onToggle}
      className="w-full flex justify-between items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-blue-600" />
        <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {actionButton}
        <ChevronDown
          className={cn('w-5 h-5 text-gray-400 transition-transform', { 'rotate-180': isOpen })}
        />
      </div>
    </button>
    <div
      className={cn(
        'grid transition-all duration-300 ease-in-out',
        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      )}
    >
      <div className="overflow-hidden">
        <div className="p-4 pt-2">{children}</div>
      </div>
    </div>
  </div>
);

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onEdit }) => {
  const { categories } = useCategoryStore();
  const { removePortionFromProduct } = useProductStore();
  const [openSections, setOpenSections] = useState<string[]>(['info', 'nutrition']);
  const [portionToDelete, setPortionToDelete] = useState<ProductPortion | null>(null);

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

  const handleToggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const handleConfirmDelete = () => {
    if (product && portionToDelete) {
      removePortionFromProduct(product.id, portionToDelete.name);
      setPortionToDelete(null);
    }
  };

  const category = categories.find((c: Category) => c.id === product.categoryId);

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AccordionSection
          title="Основная информация"
          icon={Info}
          isOpen={openSections.includes('info')}
          onToggle={() => handleToggleSection('info')}
          actionButton={
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Редактировать продукт"
            >
              <Edit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          }
        >
          <div className="space-y-4 p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {category && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Категория</p>
                    <p className="text-base text-gray-600 dark:text-gray-300">
                      {category.emoji} {category.name}
                    </p>
                  </div>
                </div>
              )}
              {product.isPerishable && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Thermometer className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Особенность</p>
                    <p className="text-base text-gray-600 dark:text-gray-300">Скоропортящийся</p>
                  </div>
                </div>
              )}
            </div>
            {product.description && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </AccordionSection>

        <AccordionSection
          title="Пищевая ценность"
          icon={BarChart}
          isOpen={openSections.includes('nutrition')}
          onToggle={() => handleToggleSection('nutrition')}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Flame className="w-5 h-5 mt-0.5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Калории</p>
                <p className="text-base text-gray-600 dark:text-gray-300">{product.calories}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Puzzle className="w-5 h-5 mt-0.5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Белки</p>
                <p className="text-base text-gray-600 dark:text-gray-300">{product.proteins} г</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Puzzle className="w-5 h-5 mt-0.5 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Жиры</p>
                <p className="text-base text-gray-600 dark:text-gray-300">{product.fats} г</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Puzzle className="w-5 h-5 mt-0.5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Углеводы</p>
                <p className="text-base text-gray-600 dark:text-gray-300">{product.carbs} г</p>
              </div>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection
          title="Порции"
          icon={Package}
          isOpen={openSections.includes('portions')}
          onToggle={() => handleToggleSection('portions')}
          actionButton={
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Добавить или изменить порции"
            >
              <PackagePlus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          }
        >
          <div className="space-y-2">
            {product.portions.map((portion, index) => (
              <div
                key={index}
                className="group relative flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <span className="font-medium text-gray-700 dark:text-gray-300">{portion.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {portion.weight} г
                  </span>
                  <div className="absolute top-1/2 -translate-y-1/2 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setPortionToDelete(portion)}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md"
                      title="Удалить порцию"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AccordionSection>
      </div>
      <ConfirmModal
        isOpen={!!portionToDelete}
        onClose={() => setPortionToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Удалить порцию?"
        variant="danger"
      >
        <p>
          Вы уверены, что хотите удалить порцию{' '}
          <span className="font-bold">{portionToDelete?.name}</span>?
        </p>
      </ConfirmModal>
    </div>
  );
};

export default ProductDetail;
