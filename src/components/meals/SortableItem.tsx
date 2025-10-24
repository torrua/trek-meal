// src/components/meals/SortableItem.tsx
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { Product, Dish } from '../../types';
import ItemContent from './ItemContent';

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
  onUpdateWeight,
  onEditItem,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const [isHovered, setIsHovered] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isProduct = item.type === 'product';
  const isDish = item.type === 'dish';

  // Light background colors for visual distinction
  const bgColor = isProduct
    ? 'bg-blue-500/5 hover:bg-blue-500/10'
    : 'bg-orange-500/5 hover:bg-orange-500/10';

  const borderColor = isProduct
    ? 'border-blue-500/20 hover:border-blue-500/40'
    : 'border-orange-500/20 hover:border-orange-500/40';

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${bgColor} border ${borderColor} rounded-lg p-3 transition-all duration-200 hover:shadow-sm`}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className={`cursor-grab active:cursor-grabbing p-1 mt-0.5 flex-shrink-0 rounded transition-colors ${
            isHovered ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <ItemContent
            item={item}
            products={products}
            dishes={dishes}
            onRemove={() => onRemove(index)}
            onUpdateWeight={(weight) => onUpdateWeight(index, weight)}
            onEditItem={() => onEditItem(item)}
          />
        </div>
      </div>
    </div>
  );
};

export default SortableItem;
