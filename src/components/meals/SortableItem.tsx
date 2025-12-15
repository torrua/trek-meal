import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Product, Dish, MealPlanItem } from '../../types';
import MealItemContent from './MealItemContent';

interface SortableItemProps {
  id: string;
  index: number;
  item: MealPlanItem;
  products: Product[];
  dishes: Dish[];
  onRemove: (index: number) => void;
  onUpdateWeight: (index: number, weight: number) => void;
  onEditItem: (item: MealPlanItem) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({
  id,
  index,
  item,
  products,
  dishes,
  onRemove,
  onUpdateWeight,
  onEditItem,
}) => {
  const { setNodeRef, transform, transition, isDragging, attributes, listeners } = useSortable({
    id,
    data: { id, index },
  });

  const style: React.CSSProperties = {
    // Translate.toString работает стабильнее, чем Transform.toString в сложных лэйаутах
    transform: CSS.Translate.toString(transform),
    // Отключаем transition во время драга, чтобы элемент не "плавал" за курсором с задержкой
    transition: isDragging ? undefined : transition,
    // Полностью скрываем элемент на месте (он заменяется Порталом)
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 1 : 'auto',
    touchAction: 'none',
  };

  const gradientClass = item.type === 'product' ? 'gradient-product' : 'gradient-dish';

  return (
    <div ref={setNodeRef} style={style}>
      <div className={`rounded-xl p-3 shadow-sm ${gradientClass}`}>
        <MealItemContent
          item={item}
          products={products}
          dishes={dishes}
          onRemove={() => onRemove(index)}
          onUpdateWeight={
            item.type === 'product' ? (weight) => onUpdateWeight(index, weight) : undefined
          }
          onEditItem={() => onEditItem(item)}
          showActions={true}
          dragHandleProps={{ attributes, listeners }}
        />
      </div>
    </div>
  );
};

export default SortableItem;
