// src/components/meals/SortableItem.tsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Product, Dish, MealPlanItem } from '../../types';
import ItemContent from './ItemContent';

interface SortableItemProps {
  id: string;
  index: number;
  item: MealPlanItem;
  products: Product[];
  dishes: Dish[];
  onRemove: (index: number) => void;
  onUpdateWeight: (index: number, weight: number) => void;
  onEditItem: (item: MealPlanItem) => void;
  showCurrentPortion?: boolean;
  onTogglePortion?: () => void;
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
  showCurrentPortion = false,
  onTogglePortion,
}) => {
  const { setNodeRef, transform, transition, isDragging, attributes, listeners } = useSortable({
    id,
  });

  // Inline styles необходимы для dnd-kit drag and drop функциональности
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Используем ItemContent для всех элементов (и блюд, и продуктов)
  const isDish = item.type === 'dish';

  return (
    <div ref={setNodeRef} className="touch-none" style={style}>
      <div
        className={`${
          isDish
            ? '[background:var(--color-dish-gradient)] border border-[#f59e0b] shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)]'
            : '[background:var(--color-product-gradient)] border border-[#3b82f6] shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)]'
        } rounded-xl transition-all duration-200 p-3 hover:bg-card-hover hover:shadow-[0_4px_8px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)]`}
      >
        <ItemContent
          item={item}
          products={products}
          dishes={dishes}
          onRemove={() => onRemove(index)}
          onUpdateWeight={
            item.type === 'product' ? (weight) => onUpdateWeight(index, weight) : undefined
          }
          onEditItem={() => onEditItem(item)}
          showActions={true}
          showCurrentPortion={showCurrentPortion}
          onTogglePortion={onTogglePortion}
          dragHandleProps={{
            attributes,
            listeners: listeners || {},
          }}
        />
      </div>
    </div>
  );
};

export default SortableItem;
