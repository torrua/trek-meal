// src/components/dishes/SortableDishItem.tsx

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Product, DishProduct } from '../../types';
import DishItemContent from './DishItemContent';

interface SortableDishItemProps {
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
}

const SortableDishItem: React.FC<SortableDishItemProps> = ({
  product,
  selectedProduct,
  portionOptions,
  currentPortion,
  index,
  onPortionChange,
  onWeightChange,
  onDelete,
  onViewProduct,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.productId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
  };

  return (
    <div ref={setNodeRef} className="touch-none" style={style}>
      <div className="gradient-product rounded-xl p-3">
        <DishItemContent
          product={product}
          selectedProduct={selectedProduct}
          portionOptions={portionOptions}
          currentPortion={currentPortion}
          index={index}
          onPortionChange={onPortionChange}
          onWeightChange={onWeightChange}
          onDelete={onDelete}
          onViewProduct={onViewProduct}
          dragHandleProps={{
            attributes,
            listeners: listeners || {},
          }}
        />
      </div>
    </div>
  );
};

export default SortableDishItem;
