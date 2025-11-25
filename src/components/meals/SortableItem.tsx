// src/components/meals/SortableItem.tsx
import React, { useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Component, Weight } from 'lucide-react';
import type { Product, Dish, MealPlanItem } from '../../types';
import MealItemCard from '../planning/MealItemCard'; // Импортируем новый компонент

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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  // Inline styles необходимы для dnd-kit drag and drop функциональности
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const itemData =
    item.type === 'product'
      ? products.find((p) => p.id === item.itemId)
      : dishes.find((d) => d.id === item.itemId);

  // Получаем состав блюда для отображения
  const dishIngredients = useMemo(() => {
    if (item.type !== 'dish' || !itemData) return [];
    const dish = itemData as Dish;
    return dish.products
      .map((dp) => {
        const product = products.find((p) => p.id === dp.productId);
        return product ? { name: product.name, weight: dp.weight } : null;
      })
      .filter((ingredient): ingredient is { name: string; weight: number } => ingredient !== null);
  }, [item.type, itemData, products]);

  return (
    <div ref={setNodeRef} className="touch-none" style={style}>
      <MealItemCard
        type={item.type}
        itemData={itemData}
        weight={item.type === 'product' ? item.weight : undefined}
        onRemove={() => onRemove(index)}
        onEdit={() => onEditItem(item)}
        onUpdateWeight={
          item.type === 'product' ? (weight) => onUpdateWeight(index, weight) : undefined
        }
        dragHandleProps={{ ...attributes, ...listeners }}
      >
        {/* Передаем состав блюда как children */}
        {dishIngredients.length > 0 && (
          <div className="space-y-1">
            {dishIngredients.map((ingredient: { name: string; weight: number }, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-1.5 bg-card border border-border rounded text-xs"
              >
                <span className="flex items-center gap-1.5">
                  <Component className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground font-medium">{ingredient.name}</span>
                </span>
                <span className="text-muted-foreground font-medium text-xs flex items-center gap-1">
                  <Weight className="w-3 h-3" />
                  {ingredient.weight} г
                </span>
              </div>
            ))}
          </div>
        )}
      </MealItemCard>
    </div>
  );
};

export default SortableItem;
