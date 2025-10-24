// src/components/meals/MealForm.tsx
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Utensils,
  Info,
  Search,
  TrendingUp,
  Hash,
  Component,
  Soup,
  Flame,
  Beef,
  Droplet,
  Wheat,
  Scale,
  Weight,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Meal, MealData, MealPlanItem } from '../../types';
import useProductStore from '../../stores/useProductStore';
import useDishStore from '../../stores/useDishStore';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import Button from '../../ui/Button';
import SortableItemComponent from './SortableItem';
import { calculateNutrition } from './mealFormUtils';
import ItemContent from './ItemContent';

const mealFormSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  items: z
    .array(
      z.object({
        instanceId: z.string(),
        type: z.enum(['product', 'dish']),
        itemId: z.number(),
        weight: z.number().min(1, 'Вес должен быть больше 0').optional(),
      })
    )
    .min(1, 'Добавьте хотя бы один компонент'),
});

type MealFormValues = z.infer<typeof mealFormSchema>;

interface MealFormProps {
  meal?: Meal | null;
  onSubmit: (data: MealData) => void;
  onCancel: () => void;
  defaultName?: string;
}

const MealForm: React.FC<MealFormProps> = ({ meal, onSubmit, onCancel, defaultName }) => {
  const { products } = useProductStore();
  const { dishes } = useDishStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const searchInputRef = useRef<HTMLDivElement>(null);

  const handleEditItem = (item: any) => {
    if (item.type === 'product') {
      const product = products.find((p) => p.id === item.itemId);
      if (product) {
        navigate(`/products?selectedId=${product.id}`);
      }
    } else if (item.type === 'dish') {
      const dish = dishes.find((d) => d.id === item.itemId);
      if (dish) {
        navigate(`/dishes?selectedId=${dish.id}`);
      }
    }
  };

  const {
    control,
    formState: { errors },
    watch,
  } = useForm<MealFormValues>({
    resolver: zodResolver(mealFormSchema),
    defaultValues: {
      name: meal?.name || defaultName || '',
      description: meal?.description || '',
      items: meal?.items || [],
    },
  });
  const { fields, append, remove, move, update } = useFieldArray({ control, name: 'items' });
  const watchItems = watch('items');

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
      }
    };

    if (showAddMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAddMenu]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(query));
  }, [products, searchQuery]);

  const filteredDishes = useMemo(() => {
    if (!searchQuery.trim()) return dishes;
    const query = searchQuery.toLowerCase();
    return dishes.filter((d) => d.name.toLowerCase().includes(query));
  }, [dishes, searchQuery]);

  const totalNutrition = useMemo(() => {
    let calories = 0,
      proteins = 0,
      fats = 0,
      carbs = 0;
    watchItems.forEach((item) => {
      const nutrition = calculateNutrition(item, products, dishes);
      if (nutrition) {
        calories += nutrition.calories;
        proteins += nutrition.proteins;
        fats += nutrition.fats;
        carbs += nutrition.carbs;
      }
    });
    return {
      calories: Math.round(calories),
      proteins: Math.round(proteins * 10) / 10,
      fats: Math.round(fats * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
    };
  }, [watchItems, products, dishes]);

  const handleAddItem = (itemId: number, type: 'product' | 'dish') => {
    let defaultWeight = 100; // Default weight for both products and dishes
    if (type === 'product') {
      const product = products.find((p) => p.id === itemId);
      defaultWeight = product && product.portions.length > 0 ? product.portions[0].weight : 100;
    } else if (type === 'dish') {
      // For dishes, we can calculate the total weight of all ingredients as default
      const dish = dishes.find((d) => d.id === itemId);
      if (dish) {
        defaultWeight = dish.products.reduce((sum, p) => sum + p.weight, 0) || 100;
      }
    }
    append({
      instanceId: `${type}-${Date.now()}`,
      type,
      itemId,
      weight: defaultWeight,
    });
    setShowAddMenu(false);
    setSearchQuery('');
  };

  const updateItemWeight = (index: number, weight: number) => {
    // Only allow weight updates for products, not dishes
    if (watchItems[index].type === 'product') {
      const updatedItem = { ...watchItems[index], weight };
      update(index, updatedItem);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((item) => item.id === active.id);
      const newIndex = fields.findIndex((item) => item.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  const processSubmit = () => {
    const name = watch('name');
    const description = watch('description');
    if (!name.trim() || watchItems.length === 0) return;
    const mealData: MealData = {
      name,
      description,
      items: watchItems.map(({ instanceId: _, ...item }) => item) as MealPlanItem[],
    };
    onSubmit(mealData);
  };

  const activeItem = activeId ? watchItems.find((item, idx) => fields[idx].id === activeId) : null;

  return (
    <>
      <div className="space-y-6 p-1">
        <div className="p-6 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 border border-border rounded-xl">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Info className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Основная информация</h2>
          </div>
          <div className="space-y-4">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Название приёма пищи"
                  error={errors.name?.message}
                  placeholder="Например, Завтрак, Обед, Ужин..."
                  autoFocus
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  label="Краткое описание"
                  rows={3}
                  placeholder="Добавьте заметки или комментарии..."
                />
              )}
            />
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-orange-500/5 via-yellow-500/5 to-green-500/5 border border-border rounded-xl">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Utensils className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Состав</h2>
              {watchItems.length > 0 && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Hash className="w-3.5 h-3.5" />
                  {watchItems.length}
                </span>
              )}
            </div>

            {watchItems.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border">
                <TrendingUp className="w-4 h-4 text-primary" />
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-600" />
                    <span className="font-semibold text-orange-600">{totalNutrition.calories}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Beef className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-semibold text-blue-600">{totalNutrition.proteins}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5 text-yellow-600" />
                    <span className="font-semibold text-yellow-600">{totalNutrition.fats}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wheat className="w-3.5 h-3.5 text-green-600" />
                    <span className="font-semibold text-green-600">{totalNutrition.carbs}</span>
                  </div>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-1">
                  <Weight className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-semibold text-muted-foreground text-sm">
                    {watchItems.reduce((total, item) => total + (item.weight || 0), 0)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="relative mb-4" ref={searchInputRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowAddMenu(true)}
                placeholder="Найти продукт или блюдо..."
                className="w-full pl-10 pr-3 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/60 transition-all"
              />
            </div>

            {showAddMenu && (
              <div className="absolute z-20 w-full mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                <div className="p-2 max-h-80 overflow-y-auto">
                  {filteredDishes.length === 0 && filteredProducts.length === 0 ? (
                    <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                      Ничего не найдено
                    </div>
                  ) : (
                    <>
                      {filteredDishes.length > 0 && (
                        <div className="mb-2">
                          <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                            <Soup className="w-3.5 h-3.5 text-orange-500" />
                            Блюда ({filteredDishes.length})
                          </div>
                          {filteredDishes.map((dish) => (
                            <button
                              key={dish.id}
                              type="button"
                              onClick={() => handleAddItem(dish.id, 'dish')}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-2 rounded"
                            >
                              <Soup className="w-3.5 h-3.5 text-orange-500" />
                              {dish.name}
                            </button>
                          ))}
                        </div>
                      )}
                      {filteredProducts.length > 0 && (
                        <div>
                          <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                            <Component className="w-3.5 h-3.5 text-blue-500" />
                            Продукты ({filteredProducts.length})
                          </div>
                          {filteredProducts.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => handleAddItem(product.id, 'product')}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-2 rounded"
                            >
                              <Component className="w-3.5 h-3.5 text-blue-500" />
                              {product.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                {fields.map((field, index) => (
                  <SortableItemComponent
                    key={field.id}
                    id={field.id}
                    index={index}
                    item={watchItems[index]}
                    products={products}
                    dishes={dishes}
                    onRemove={remove}
                    onUpdateWeight={updateItemWeight}
                    onEditItem={handleEditItem}
                  />
                ))}
              </SortableContext>
              <DragOverlay>
                {activeId && activeItem ? (
                  <div className="bg-card border border-border rounded-lg p-3 shadow-lg opacity-100">
                    <ItemContent
                      item={activeItem}
                      products={products}
                      dishes={dishes}
                      showActions={false}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
            {watchItems.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Добавьте продукты или блюда</p>
                <p className="text-xs mt-1">Перетаскивайте элементы для изменения порядка</p>
              </div>
            )}
            {errors.items && (
              <p className="text-sm text-danger mt-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                {errors.items.message || errors.items.root?.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="button" variant="primary" onClick={processSubmit} icon={Utensils}>
            {meal ? 'Сохранить изменения' : 'Создать приём пищи'}
          </Button>
        </div>
      </div>
    </>
  );
};

export default MealForm;
