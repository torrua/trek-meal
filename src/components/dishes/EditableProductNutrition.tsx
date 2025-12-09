// src/components/dishes/EditableProductNutrition.tsx

import React from 'react';
import type { Product } from '../../types';
import NutritionButton from '../../ui/NutritionButton';

interface EditableProductNutritionProps {
  product: Product | null;
  weight: number;
}

const EditableProductNutrition: React.FC<EditableProductNutritionProps> = ({ product, weight }) => {
  const nutrition = React.useMemo(() => {
    if (!product) return null;
    const weightRatio = weight / 100;
    return {
      calories: Math.round((product.calories || 0) * weightRatio),
      proteins: Math.round((product.proteins || 0) * weightRatio * 10) / 10,
      fats: Math.round((product.fats || 0) * weightRatio * 10) / 10,
      carbs: Math.round((product.carbs || 0) * weightRatio * 10) / 10,
    };
  }, [product, weight]);

  if (!nutrition) return null;

  return (
    <NutritionButton
      calories={nutrition.calories}
      proteins={nutrition.proteins}
      fats={nutrition.fats}
      carbs={nutrition.carbs}
      weight={weight}
      title={`${nutrition.calories} ккал`}
    />
  );
};

export default EditableProductNutrition;
