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
  Trash2,
  BarChart,
  PackagePlus,
  Component,
} from 'lucide-react';
import type { Product, Category, ProductPortion } from '../../types';
import useCategoryStore from '../../stores/useCategoryStore';
import useProductStore from '../../stores/useProductStore';
import ConfirmModal from '../../ui/ConfirmModal';
import DetailPane from '../../ui/DetailPane';
import Button from '../../ui/Button';

interface ProductDetailProps {
  product: Product | null;
  onEdit: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onEdit }) => {
  const { categories } = useCategoryStore();
  const { removePortionFromProduct } = useProductStore();
  const [openSections, setOpenSections] = useState<string[]>(['info', 'nutrition', 'portions']);
  const [portionToDelete, setPortionToDelete] = useState<ProductPortion | null>(null);

  if (!product) {
    return null;
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

  const sections = [
    {
      id: 'info',
      title: 'Основная информация',
      icon: Info,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {category && (
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Tag className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Категория</p>
                  <p className="text-base text-muted-foreground">
                    {category.emoji} {category.name}
                  </p>
                </div>
              </div>
            )}
            {product.isPerishable && (
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Thermometer className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Особенность</p>
                  <p className="text-base text-muted-foreground">Скоропортящийся</p>
                </div>
              </div>
            )}
          </div>
          {product.description && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'nutrition',
      title: 'Пищевая ценность (на 100г)',
      icon: BarChart,
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <Flame className="w-5 h-5 mt-0.5 text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-foreground">Калории</p>
              <p className="text-base text-muted-foreground">{product.calories}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <Puzzle className="w-5 h-5 mt-0.5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-foreground">Белки</p>
              <p className="text-base text-muted-foreground">{product.proteins} г</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <Puzzle className="w-5 h-5 mt-0.5 text-amber-500" />
            <div>
              <p className="text-sm font-medium text-foreground">Жиры</p>
              <p className="text-base text-muted-foreground">{product.fats} г</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <Puzzle className="w-5 h-5 mt-0.5 text-orange-500" />
            <div>
              <p className="text-sm font-medium text-foreground">Углеводы</p>
              <p className="text-base text-muted-foreground">{product.carbs} г</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'portions',
      title: 'Порции',
      icon: Package,
      actionButton: (
        <Button size="sm" variant="ghost" onClick={onEdit} title="Добавить или изменить порции">
          <PackagePlus className="w-4 h-4" />
        </Button>
      ),
      content: (
        <div className="space-y-2">
          {product.portions.map((portion, index) => (
            <div
              key={index}
              className="group relative flex justify-between items-center p-3 bg-muted rounded-lg"
            >
              <span className="font-medium text-foreground">{portion.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{portion.weight} г</span>
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
      ),
    },
  ];

  return (
    <>
      <DetailPane
        sections={sections}
        openSections={openSections}
        onToggleSection={handleToggleSection}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
              <Component className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{product.name}</h2>
              <p className="text-muted-foreground">{category?.name || 'Без категории'}</p>
            </div>
          </div>
          <Button variant="secondary" onClick={onEdit}>
            <Edit className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Изменить</span>
          </Button>
        </div>
      </DetailPane>
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
    </>
  );
};

export default ProductDetail;
