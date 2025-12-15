import React, { useState } from 'react';
import { createPortal } from 'react-dom'; // Импорт портала
import { Utensils } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragOverlayProps,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { UseFieldArrayReturn } from 'react-hook-form';

import type { Product, Dish, Category, MealPlanItem } from '../../../types';
import SortableItemComponent from '../SortableItem';
import MealItemContent from '../MealItemContent';
import ProductSearch from './ProductSearch';

interface MealCompositionProps {
  fields: UseFieldArrayReturn<any, 'items', 'id'>['fields'] | any[];
  items: MealPlanItem[];
  products: Product[];
  dishes: Dish[];
  categories: Category[];

  onAdd: (itemId: number, type: 'product' | 'dish') => void;
  onRemove: (index: number) => void;
  onUpdateWeight: (index: number, weight: number) => void;
  onMove: (oldIndex: number, newIndex: number) => void;
  onEditItem: (item: MealPlanItem) => void;

  error?: string;
}

// Отключаем лишние анимации при броске, чтобы не было дерганий
const dropAnimationConfig: DragOverlayProps['dropAnimation'] = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

const MealComposition: React.FC<MealCompositionProps> = ({
  fields,
  items,
  products,
  dishes,
  categories,
  onAdd,
  onRemove,
  onUpdateWeight,
  onMove,
  onEditItem,
  error,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeItem = activeId ? items.find((_, idx) => fields[idx]?.id === activeId) : null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Увеличил дистанцию до 8px, чтобы исключить случайные срабатывания при клике
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    // Блокируем скролл на body во время перетаскивания, чтобы страница не ехала
    document.body.style.cursor = 'grabbing';
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    document.body.style.cursor = '';

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((item) => item.id === active.id);
      const newIndex = fields.findIndex((item) => item.id === over.id);
      onMove(oldIndex, newIndex);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    document.body.style.cursor = '';
  };

  return (
    <div>
      <ProductSearch products={products} dishes={dishes} categories={categories} onAdd={onAdd} />

      <div className="space-y-4 pt-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            {fields.map((field, index) => (
              <SortableItemComponent
                key={field.id}
                id={field.id}
                index={index}
                item={items[index]}
                products={products}
                dishes={dishes}
                onRemove={onRemove}
                onUpdateWeight={onUpdateWeight}
                onEditItem={onEditItem}
              />
            ))}
          </SortableContext>

          {/* ГЛОБАЛЬНОЕ ИСПРАВЛЕНИЕ: Рендерим Overlay в Portal (document.body) */}
          {createPortal(
            <DragOverlay dropAnimation={dropAnimationConfig}>
              {activeId && activeItem ? (
                <div
                  // Строго фиксируем ширину перетаскиваемого элемента, если нужно,
                  // или даем ему растянуться, но в рамках портала он не сломает верстку
                  style={{ width: '100%' }}
                  className={`rounded-xl p-3 shadow-2xl cursor-grabbing ring-2 ring-primary/20 bg-card ${
                    activeItem.type === 'product' ? 'gradient-product' : 'gradient-dish'
                  }`}
                >
                  <MealItemContent
                    item={activeItem}
                    products={products}
                    dishes={dishes}
                    showActions={false}
                  />
                </div>
              ) : null}
            </DragOverlay>,
            document.body
          )}

          <>
            {fields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Добавьте продукты или блюда</p>
                <p className="text-xs mt-1">Перетаскивайте элементы для изменения порядка</p>
                {error && <p className="text-xs mt-2 text-danger">{error}</p>}
              </div>
            )}
          </>
        </DndContext>
      </div>
    </div>
  );
};

export default MealComposition;
