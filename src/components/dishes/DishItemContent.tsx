// src/components/dishes/DishItemContent.tsx

import React from 'react';
import { Component, Trash2, SquareArrowOutUpRight } from 'lucide-react';
import type { Product, DishProduct } from '../../types';
import Button from '../../ui/Button';
import DropdownSelect from '../../ui/DropdownSelect';
import NutritionButton from '../../ui/NutritionButton';
import Input from '../../ui/Input';

interface DishItemContentProps {
  product: DishProduct;
  selectedProduct: Product | undefined;
  portionOptions: Array<{
    value: string;
    label: string;
    menuLabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  currentPortion: {
    value: string;
    label: string;
    menuLabel: string;
    icon: React.ComponentType<{ className?: string }>;
  } | null;
  index: number;
  onPortionChange: (index: number, value: string) => void;
  onWeightChange: (index: number, value: string) => void;
  onDelete: (index: number) => void;
  onViewProduct?: (productId: number) => void;
  dragHandleProps?: {
    attributes: React.HTMLAttributes<HTMLElement>;
    listeners: React.HTMLAttributes<HTMLElement>;
  };
}

const DishItemContent: React.FC<DishItemContentProps> = ({
  product,
  selectedProduct,
  portionOptions,
  currentPortion,
  index,
  onPortionChange,
  onWeightChange,
  onDelete,
  onViewProduct,
  dragHandleProps,
}) => {
  const [showProductPortion, setShowProductPortion] = React.useState(true);

  const nutrition = React.useMemo(() => {
    if (!selectedProduct) return null;
    const weightRatio = Number(product.weight) / 100;
    return {
      calories: Math.round((selectedProduct.calories || 0) * weightRatio),
      proteins: Math.round((selectedProduct.proteins || 0) * weightRatio * 10) / 10,
      fats: Math.round((selectedProduct.fats || 0) * weightRatio * 10) / 10,
      carbs: Math.round((selectedProduct.carbs || 0) * weightRatio * 10) / 10,
    };
  }, [selectedProduct, product.weight]);

  const hasPortions = selectedProduct?.portions && selectedProduct.portions.length > 0;

  return (
    <div className="space-y-1">
      <div
        className={`flex items-center gap-2 ${hasPortions ? 'cursor-pointer' : ''}`}
        onClick={() => {
          if (hasPortions) {
            setShowProductPortion(!showProductPortion);
          }
        }}
      >
        <div
          className="cursor-grab active:cursor-grabbing flex-shrink-0"
          {...dragHandleProps?.attributes}
          {...dragHandleProps?.listeners}
        >
          <Component className="w-4 h-4 text-blue-500" />
        </div>
        <h4 className="font-medium text-foreground truncate flex-1 min-w-0">
          {selectedProduct?.name || 'Неизвестный продукт'}
        </h4>
        <div className="flex items-center gap-1 flex-shrink-0">
          {nutrition && (
            <NutritionButton
              calories={nutrition.calories}
              proteins={nutrition.proteins}
              fats={nutrition.fats}
              carbs={nutrition.carbs}
              weight={Number(product.weight)}
            />
          )}
          {onViewProduct && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewProduct(product.productId);
              }}
              className="!border-blue-500/20 bg-blue-500/10 text-blue-600"
              title="Открыть продукт"
            >
              <SquareArrowOutUpRight className="w-4 h-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(index);
            }}
            className="!border-danger/20 bg-danger/10 text-danger"
            title="Удалить"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {showProductPortion && (
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">Порция</label>
            <DropdownSelect
              options={portionOptions}
              value={String(currentPortion?.value || '')}
              onChange={(value) => onPortionChange(index, value as string)}
              placeholder="Выберите порцию"
              icon={currentPortion?.icon || Component}
            />
          </div>
          <div className="w-1/4">
            <label className="block text-sm font-medium text-foreground mb-2">Вес (г)</label>
            <div className="flex items-center gap-1">
              <Input
                id={`weight-${index}`}
                type="number"
                value={product.weight}
                onChange={(e) => onWeightChange(index, e.target.value)}
                placeholder="Вес"
                min="1"
                className="w-full"
                aria-label={`Вес продукта: ${product.weight} грамм`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DishItemContent;
