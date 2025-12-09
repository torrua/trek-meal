// src/components/dishes/ProductContentReadOnly.tsx

import React from 'react';
import { Component, PieChart, Circle, Weight } from 'lucide-react';
import type { Product, DishProduct } from '../../types';
import NutritionButton from '../../ui/NutritionButton';

interface ProductContentReadOnlyProps {
  dishProduct: DishProduct;
  product: Product | undefined;
}

const ProductContentReadOnly: React.FC<ProductContentReadOnlyProps> = ({
  dishProduct,
  product,
}) => {
  const [showProductPortion, setShowProductPortion] = React.useState(false);

  const nutrition = React.useMemo(() => {
    if (!product) return null;
    const weightRatio = Number(dishProduct.weight) / 100;
    return {
      calories: Math.round((product.calories || 0) * weightRatio),
      proteins: Math.round((product.proteins || 0) * weightRatio * 10) / 10,
      fats: Math.round((product.fats || 0) * weightRatio * 10) / 10,
      carbs: Math.round((product.carbs || 0) * weightRatio * 10) / 10,
    };
  }, [product, dishProduct.weight]);

  const portion = React.useMemo(() => {
    if (!product) return null;
    return product.portions?.find((p) => Number(p.weight) === Number(dishProduct.weight));
  }, [product, dishProduct.weight]);

  const portions = React.useMemo(() => {
    if (!product) return [];
    return product.portions || [];
  }, [product]);

  const PortionIcon = portion?.isIndivisible ? Circle : PieChart;

  return (
    <div
      className={`space-y-1 ${portions && portions.length > 0 ? 'cursor-pointer' : ''}`}
      onClick={() => {
        if (portions && portions.length > 0) {
          setShowProductPortion(!showProductPortion);
        }
      }}
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Component className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <h4 className="font-medium text-foreground truncate">
            {product?.name || 'Неизвестный продукт'}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {nutrition && (
            <NutritionButton
              calories={nutrition.calories}
              proteins={nutrition.proteins}
              fats={nutrition.fats}
              carbs={nutrition.carbs}
              weight={Number(dishProduct.weight)}
            />
          )}
        </div>
      </div>

      {portions && portions.length > 0 && showProductPortion && (
        <div className="pt-2">
          <div className="view-mode-field view-mode-single-line flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <PortionIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground font-medium text-sm">
                {portion ? portion.name : 'Другой'}
              </span>
            </span>
            <span className="text-muted-foreground font-medium text-sm flex items-center gap-1">
              {dishProduct.weight}
              <Weight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductContentReadOnly;
