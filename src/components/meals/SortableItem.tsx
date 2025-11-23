// src/components/meals/SortableItem.tsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Product, Dish } from '../../types';
import MealItemCard from '../planning/MealItemCard'; // Импортируем новый компонент

interface SortableItemProps {
  id: string;
  index: number;
  item: any;
  products: Product[];
  dishes: Dish[];
  onRemove: (index: number) => void;
  onUpdateWeight: (index: number, weight: number) => void;
  onEditItem: (item: any) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({
  id,
  index,
  item,
  products,
  dishes,
  onRemove,
  onEditItem,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const itemData =
    item.type === 'product'
      ? products.find((p) => p.id === item.itemId)
      : dishes.find((d) => d.id === item.itemId);

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <MealItemCard
        type={item.type}
        itemData={itemData}
        weight={item.weight}
        onRemove={() => onRemove(index)}
        onEdit={() => onEditItem(item)}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

export default SortableItem;
