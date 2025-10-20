// src/components/meals/MealForm.tsx
import React, { useMemo, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Trash2,
  GripVertical,
  Utensils,
  Info,
  Component,
  Soup,
  Scale,
  Plus,
  X,
  Edit,
  ChevronDown,
  Flame,
  TrendingUp,
  Eye,
  Check,
  Hash,
} from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Meal, MealData, MealPlanItem, Product, Dish, ProductPortion } from '../../types';
import useProductStore from '../../stores/useProductStore';
import useDishStore from '../../stores/useDishStore';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import Button from '../../ui/Button';
import DropdownSelect from '../../ui/DropdownSelect';
import Modal from '../../ui/Modal';

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
}

// Helper function to calculate nutrition
const calculateNutrition = (item: any, products: Product[], dishes: Dish[]) => {
  if (item.type === 'product') {
    const product = products.find((p) => p.id === item.itemId);
    if (!product || !item.weight) return null;

    const multiplier = item.weight / 100;
    return {
      calories: Math.round(product.calories * multiplier),
      proteins: Math.round(product.proteins * multiplier * 10) / 10,
      fats: Math.round(product.fats * multiplier * 10) / 10,
      carbs: Math.round(product.carbs * multiplier * 10) / 10,
    };
  }

  if (item.type === 'dish') {
    const dish = dishes.find((d) => d.id === item.itemId);
    if (!dish) return null;

    return {
      calories: Math.round(dish.totalCalories),
      proteins: Math.round(dish.totalProteins * 10) / 10,
      fats: Math.round(dish.totalFats * 10) / 10,
      carbs: Math.round(dish.totalCarbs * 10) / 10,
    };
  }

  return null;
};

const SortableItem: React.FC<{
  id: string;
  index: number;
  item: any;
  products: Product[];
  dishes: Dish[];
  onRemove: (index: number) => void;
  onUpdateWeight: (index: number, weight: number) => void;
  onQuickView: (item: any) => void;
}> = ({ id, index, item, products, dishes, onRemove, onUpdateWeight, onQuickView }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [customWeight, setCustomWeight] = useState(item.weight?.toString() || '');
  const [showPortions, setShowPortions] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const selectedItem =
    item.type === 'product'
      ? products.find((p) => p.id === item.itemId)
      : dishes.find((d) => d.id === item.itemId);

  const nutrition = calculateNutrition(item, products, dishes);

  // For products, get portions
  const portions = useMemo(() => {
    if (item.type !== 'product' || !selectedItem) return [];
    return (selectedItem as Product).portions;
  }, [item.type, selectedItem]);

  const currentPortion = useMemo(() => {
    if (item.type !== 'product' || !item.weight) return null;
    return portions.find((p: ProductPortion) => p.weight === item.weight);
  }, [item.type, item.weight, portions]);

  const handlePortionSelect = (portion: ProductPortion) => {
    onUpdateWeight(index, portion.weight);
    setShowPortions(false);
  };

  const handleCustomWeightSave = () => {
    const weight = parseInt(customWeight, 10);
    if (!isNaN(weight) && weight > 0) {
      onUpdateWeight(index, weight);
      setIsEditingWeight(false);
    }
  };

  const handleCustomWeightCancel = () => {
    setCustomWeight(item.weight?.toString() || '');
    setIsEditingWeight(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative bg-card border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3 p-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground mt-1"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Item Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              {item.type === 'product' ? (
                <Component className="w-4 h-4 text-blue-500 flex-shrink-0" />
              ) : (
                <Soup className="w-4 h-4 text-orange-500 flex-shrink-0" />
              )}
              <h4 className="font-medium text-foreground truncate">{selectedItem?.name}</h4>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onQuickView(item)}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Быстрый просмотр"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>

          {/* Weight Control for Products */}
          {item.type === 'product' && (
            <div className="space-y-2">
              {!isEditingWeight ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPortions(!showPortions)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span className="font-medium">
                      {currentPortion ? currentPortion.name : 'Другой'}
                    </span>
                    <span className="text-muted-foreground">({item.weight} г)</span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${showPortions ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCustomWeight(item.weight?.toString() || '');
                      setIsEditingWeight(true);
                    }}
                    title="Указать вес вручную"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={customWeight}
                    onChange={(e) => setCustomWeight(e.target.value)}
                    placeholder="Вес в граммах"
                    className="w-32 text-sm"
                    min="1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCustomWeightSave();
                      }
                      if (e.key === 'Escape') {
                        handleCustomWeightCancel();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleCustomWeightSave}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCustomWeightCancel}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}

              {/* Portions Dropdown */}
              {showPortions && portions.length > 0 && (
                <div className="absolute z-10 mt-1 w-64 bg-card border border-border rounded-lg shadow-lg py-1 max-h-60 overflow-auto">
                  {portions.map((portion: ProductPortion, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePortionSelect(portion)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between ${
                        portion.weight === item.weight ? 'bg-primary/10 text-primary' : ''
                      }`}
                    >
                      <span className="font-medium">{portion.name}</span>
                      <span className="text-muted-foreground">{portion.weight} г</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Nutrition Info */}
          {nutrition && (
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
              <div className="flex items-center gap-1.5 text-orange-600">
                <Flame className="w-3.5 h-3.5" />
                <span className="font-semibold">{nutrition.calories}</span>
                <span className="text-muted-foreground">ккал</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-blue-600 font-semibold">Б: {nutrition.proteins}г</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-yellow-600 font-semibold">Ж: {nutrition.fats}г</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-600 font-semibold">У: {nutrition.carbs}г</span>
              </div>
            </div>
          )}
        </div>

        {/* Remove Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          className="text-danger hover:bg-danger/10 flex-shrink-0 mt-1"
          title="Удалить"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Quick View Modal Component
const QuickViewModal: React.FC<{
  item: any;
  products: Product[];
  dishes: Dish[];
  onClose: () => void;
}> = ({ item, products, dishes, onClose }) => {
  const selectedItem =
    item.type === 'product'
      ? products.find((p) => p.id === item.itemId)
      : dishes.find((d) => d.id === item.itemId);

  if (!selectedItem) return null;

  const nutrition = calculateNutrition(item, products, dishes);

  return (
    <Modal isOpen onClose={onClose} title={selectedItem.name}>
      <div className="space-y-4">
        {selectedItem.description && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
          </div>
        )}

        {nutrition && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-muted-foreground">Калории</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">{nutrition.calories}</p>
              <p className="text-xs text-muted-foreground">ккал</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-2">БЖУ</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-600">Белки:</span>
                  <span className="font-semibold">{nutrition.proteins}г</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-600">Жиры:</span>
                  <span className="font-semibold">{nutrition.fats}г</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Углеводы:</span>
                  <span className="font-semibold">{nutrition.carbs}г</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {item.type === 'product' && selectedItem.portions && (
          <div>
            <h4 className="text-sm font-medium mb-2">Доступные порции:</h4>
            <div className="space-y-1">
              {selectedItem.portions.map((portion: ProductPortion, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
                >
                  <span>{portion.name}</span>
                  <span className="text-muted-foreground">{portion.weight} г</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

const MealForm: React.FC<MealFormProps> = ({ meal, onSubmit, onCancel }) => {
  const { products } = useProductStore();
  const { dishes } = useDishStore();
  const [quickViewItem, setQuickViewItem] = useState<any>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<MealFormValues>({
    resolver: zodResolver(mealFormSchema),
    defaultValues: {
      name: meal?.name || '',
      description: meal?.description || '',
      items: meal?.items || [],
    },
  });

  const { fields, append, remove, move, update } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');

  // Calculate total nutrition
  const totalNutrition = useMemo(() => {
    let calories = 0;
    let proteins = 0;
    let fats = 0;
    let carbs = 0;

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

  // Group options by type for better UX
  const groupedOptions = useMemo(() => {
    const productOptions = products.map((p) => ({
      value: `product-${p.id}`,
      label: p.name,
      type: 'product' as const,
    }));

    const dishOptions = dishes.map((d) => ({
      value: `dish-${d.id}`,
      label: d.name,
      type: 'dish' as const,
    }));

    return { products: productOptions, dishes: dishOptions };
  }, [products, dishes]);

  const handleAddItem = (optionValue: string) => {
    if (!optionValue) return;
    const [type, idStr] = optionValue.split('-');
    const itemId = parseInt(idStr, 10);

    let defaultWeight = undefined;
    if (type === 'product') {
      const product = products.find((p) => p.id === itemId);
      if (product && product.portions.length > 0) {
        defaultWeight = product.portions[0].weight;
      } else {
        defaultWeight = 100;
      }
    }

    append({
      instanceId: `${type}-${Date.now()}`,
      type: type as 'product' | 'dish',
      itemId,
      weight: type === 'product' ? defaultWeight : undefined,
    });

    setShowAddMenu(false);
  };

  const updateItemWeight = (index: number, weight: number) => {
    const currentItems = watchItems;
    const updatedItem = { ...currentItems[index], weight };
    update(index, updatedItem);
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((item) => item.id === active.id);
      const newIndex = fields.findIndex((item) => item.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  const processSubmit = (data: MealFormValues) => {
    const mealData: MealData = {
      name: data.name,
      description: data.description,
      items: data.items.map(({ instanceId, ...item }) => item) as MealPlanItem[],
    };
    onSubmit(mealData);
  };

  // Count items by type
  const itemCounts = useMemo(() => {
    const counts = { products: 0, dishes: 0 };
    watchItems.forEach((item) => {
      if (item.type === 'product') counts.products++;
      else counts.dishes++;
    });
    return counts;
  }, [watchItems]);

  return (
    <>
      <form onSubmit={handleSubmit(processSubmit)} className="space-y-6 p-1">
        {/* Basic Information */}
        <div className="p-6 bg-card border border-border rounded-xl">
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
                  label="Название приема пищи"
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

        {/* Nutrition Summary */}
        {watchItems.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-orange-500/10 via-blue-500/10 to-green-500/10 rounded-xl border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Итого по приему пищи</h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Component className="w-3.5 h-3.5" />
                <span>{itemCounts.products}</span>
                <Soup className="w-3.5 h-3.5 ml-2" />
                <span>{itemCounts.dishes}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-card rounded-lg">
                <Flame className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-orange-600">{totalNutrition.calories}</p>
                <p className="text-xs text-muted-foreground">ккал</p>
              </div>
              <div className="text-center p-3 bg-card rounded-lg">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 mx-auto mb-1" />
                <p className="text-2xl font-bold text-blue-600">{totalNutrition.proteins}</p>
                <p className="text-xs text-muted-foreground">г белков</p>
              </div>
              <div className="text-center p-3 bg-card rounded-lg">
                <div className="w-5 h-5 rounded-full bg-yellow-500/20 mx-auto mb-1" />
                <p className="text-2xl font-bold text-yellow-600">{totalNutrition.fats}</p>
                <p className="text-xs text-muted-foreground">г жиров</p>
              </div>
              <div className="text-center p-3 bg-card rounded-lg">
                <div className="w-5 h-5 rounded-full bg-green-500/20 mx-auto mb-1" />
                <p className="text-2xl font-bold text-green-600">{totalNutrition.carbs}</p>
                <p className="text-xs text-muted-foreground">г углев.</p>
              </div>
            </div>
          </div>
        )}

        {/* Composition */}
        <div className="p-6 bg-card border border-border rounded-xl">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Utensils className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold flex-1">Состав</h2>
            {watchItems.length > 0 && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Hash className="w-3.5 h-3.5" />
                {watchItems.length}
              </span>
            )}
          </div>

          <div className="space-y-3 mb-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                {fields.map((field, index) => (
                  <SortableItem
                    key={field.id}
                    id={field.id}
                    index={index}
                    item={watchItems[index]}
                    products={products}
                    dishes={dishes}
                    onRemove={remove}
                    onUpdateWeight={updateItemWeight}
                    onQuickView={setQuickViewItem}
                  />
                ))}
              </SortableContext>
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

          {/* Add Item Button with Grouped Menu */}
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="w-full border-2 border-dashed hover:border-primary hover:bg-primary/5"
              disabled={groupedOptions.products.length === 0 && groupedOptions.dishes.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить продукт или блюдо
              <ChevronDown className="w-3 h-3 ml-auto" />
            </Button>

            {showAddMenu && (
              <div className="absolute z-10 w-full mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                {groupedOptions.products.length > 0 && (
                  <div>
                    <div className="px-3 py-2 bg-muted/50 border-b border-border flex items-center gap-2">
                      <Component className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase">
                        Продукты ({groupedOptions.products.length})
                      </span>
                    </div>
                    <div className="max-h-48 overflow-auto">
                      {groupedOptions.products.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleAddItem(option.value)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                        >
                          <Component className="w-3.5 h-3.5 text-blue-500" />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {groupedOptions.dishes.length > 0 && (
                  <div>
                    <div className="px-3 py-2 bg-muted/50 border-b border-border flex items-center gap-2">
                      <Soup className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase">
                        Блюда ({groupedOptions.dishes.length})
                      </span>
                    </div>
                    <div className="max-h-48 overflow-auto">
                      {groupedOptions.dishes.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleAddItem(option.value)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                        >
                          <Soup className="w-3.5 h-3.5 text-orange-500" />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {groupedOptions.products.length === 0 && groupedOptions.dishes.length === 0 && (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    <p className="text-sm">Нет доступных продуктов или блюд</p>
                    <p className="text-xs mt-1">Создайте их в соответствующих разделах</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {groupedOptions.products.length === 0 && groupedOptions.dishes.length === 0 && (
            <div className="mt-3 p-4 bg-warning/5 rounded-lg border border-warning/20">
              <p className="text-sm text-muted-foreground">
                💡 Создайте продукты и блюда в соответствующих разделах, чтобы добавить их в прием
                пищи.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" variant="primary" icon={Utensils}>
            {meal ? 'Сохранить изменения' : 'Создать прием пищи'}
          </Button>
        </div>
      </form>

      {/* Quick View Modal */}
      {quickViewItem && (
        <QuickViewModal
          item={quickViewItem}
          products={products}
          dishes={dishes}
          onClose={() => setQuickViewItem(null)}
        />
      )}
    </>
  );
};

export default MealForm;
