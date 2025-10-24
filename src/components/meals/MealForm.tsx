// src/components/meals/MealForm.tsx
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Check,
  Hash,
  Beef,
  Droplet,
  Wheat,
  Search,
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
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Meal, MealData, MealPlanItem, Product, Dish, ProductPortion } from '../../types';
import useProductStore from '../../stores/useProductStore';
import useDishStore from '../../stores/useDishStore';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import Button from '../../ui/Button';
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
  defaultName?: string;
}

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
    let totalCalories = 0,
      totalProteins = 0,
      totalFats = 0,
      totalCarbs = 0;
    dish.products.forEach((dishProduct) => {
      const product = products.find((p) => p.id === dishProduct.productId);
      if (product) {
        const weightRatio = dishProduct.weight / 100;
        totalCalories += (product.calories || 0) * weightRatio;
        totalProteins += (product.proteins || 0) * weightRatio;
        totalFats += (product.fats || 0) * weightRatio;
        totalCarbs += (product.carbs || 0) * weightRatio;
      }
    });
    return {
      calories: Math.round(totalCalories),
      proteins: Math.round(totalProteins * 10) / 10,
      fats: Math.round(totalFats * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
    };
  }
  return null;
};

const ItemContent: React.FC<{
  item: any;
  products: Product[];
  dishes: Dish[];
  onRemove?: () => void;
  onUpdateWeight?: (weight: number) => void;
  onEditItem?: () => void;
  isDragging?: boolean;
  showActions?: boolean;
}> = ({
  item,
  products,
  dishes,
  onRemove,
  onUpdateWeight,
  onEditItem,
  isDragging,
  showActions = true,
}) => {
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [customWeight, setCustomWeight] = useState(item.weight?.toString() || '');
  const [showPortions, setShowPortions] = useState(false);
  const [showDishIngredients, setShowDishIngredients] = useState(false);
  const portionDropdownRef = useRef<HTMLDivElement>(null);

  const selectedItem =
    item.type === 'product'
      ? products.find((p) => p.id === item.itemId)
      : dishes.find((d) => d.id === item.itemId);
  const nutrition = calculateNutrition(item, products, dishes);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        portionDropdownRef.current &&
        !portionDropdownRef.current.contains(event.target as Node)
      ) {
        setShowPortions(false);
      }
    };

    if (showPortions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPortions]);

  const dishDetails = useMemo(() => {
    if (item.type !== 'dish' || !selectedItem) return null;
    const dish = selectedItem as Dish;
    return dish.products
      .map((dp) => {
        const product = products.find((p) => p.id === dp.productId);
        return product ? { name: product.name, weight: dp.weight } : null;
      })
      .filter(Boolean);
  }, [item.type, selectedItem, products]);

  const portions = useMemo(() => {
    if (item.type !== 'product' || !selectedItem) return [];
    return (selectedItem as Product).portions || [];
  }, [item.type, selectedItem]);

  const currentPortion = useMemo(() => {
    if (item.type !== 'product' || !item.weight) return null;
    return portions.find((p: ProductPortion) => p.weight === item.weight);
  }, [item.type, item.weight, portions]);

  const handlePortionSelect = (portion: ProductPortion) => {
    if (onUpdateWeight) onUpdateWeight(portion.weight);
    setShowPortions(false);
  };

  const handleCustomWeightSave = () => {
    const weight = parseInt(customWeight, 10);
    if (!isNaN(weight) && weight > 0 && onUpdateWeight) {
      onUpdateWeight(weight);
      setIsEditingWeight(false);
    }
  };

  const isProduct = item.type === 'product';
  const isDish = item.type === 'dish';

  return (
    <div className="space-y-3">
      {/* Header: Title + КБЖУ + Actions */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isProduct ? (
            <Component className="w-4 h-4 text-blue-500 flex-shrink-0" />
          ) : (
            <Soup className="w-4 h-4 text-orange-500 flex-shrink-0" />
          )}
          <h4 className="font-medium text-foreground truncate">{selectedItem?.name}</h4>
        </div>
        {showActions && (
          <div className="flex items-center gap-2">
            {nutrition && (
              <div className="flex items-center gap-2 h-8 px-2.5 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-semibold text-orange-600">
                    {nutrition.calories}
                  </span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-1">
                  <Beef className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-600">{nutrition.proteins}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Droplet className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-600">{nutrition.fats}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wheat className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">{nutrition.carbs}</span>
                </div>
              </div>
            )}
            {onEditItem && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onEditItem}
                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600"
                title="Редактировать"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onRemove}
                className="bg-danger/10 hover:bg-danger/20 text-danger"
                title="Удалить"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Portion Selection (Products only) */}
      {isProduct && (
        <div className="pt-2 border-t border-border/50">
          {!isEditingWeight ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() =>
                  onUpdateWeight && onUpdateWeight(Math.max(10, (item.weight || 100) - 10))
                }
                className="bg-muted hover:bg-muted/80 flex-shrink-0"
              >
                <span className="text-base font-semibold">-</span>
              </Button>
              <div className="relative flex-1" ref={portionDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowPortions(!showPortions)}
                  className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg hover:bg-muted hover:border-primary/30 transition-all flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {currentPortion ? currentPortion.name : 'Другой'}
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">({item.weight} г)</span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform ${showPortions ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>
                {showPortions && portions.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-card border border-border rounded-lg shadow-lg py-1 max-h-60 overflow-auto">
                    {portions.map((portion: ProductPortion, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePortionSelect(portion)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between ${portion.weight === item.weight ? 'bg-primary/10 text-primary' : ''}`}
                      >
                        <span className="font-medium">{portion.name}</span>
                        <span className="text-muted-foreground">{portion.weight} г</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setCustomWeight(item.weight?.toString() || '');
                  setIsEditingWeight(true);
                }}
                className="bg-muted hover:bg-muted/80 flex-shrink-0"
                title="Указать вес вручную"
              >
                <Edit className="w-3.5 h-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onUpdateWeight && onUpdateWeight((item.weight || 100) + 10)}
                className="bg-muted hover:bg-muted/80 flex-shrink-0"
              >
                <span className="text-base font-semibold">+</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={customWeight}
                onChange={(e) => setCustomWeight(e.target.value)}
                placeholder="Вес в граммах"
                className="flex-1 text-sm"
                min="1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCustomWeightSave();
                  }
                  if (e.key === 'Escape') {
                    setCustomWeight(item.weight?.toString() || '');
                    setIsEditingWeight(false);
                  }
                }}
              />
              <Button type="button" variant="primary" size="sm" onClick={handleCustomWeightSave}>
                <Check className="w-3.5 h-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCustomWeight(item.weight?.toString() || '');
                  setIsEditingWeight(false);
                }}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Dish Ingredients */}
      {isDish && dishDetails && dishDetails.length > 0 && (
        <div className="pt-2 border-t border-border/50">
          <button
            type="button"
            onClick={() => setShowDishIngredients(!showDishIngredients)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showDishIngredients ? 'rotate-180' : ''}`}
            />
            <span>Состав блюда ({dishDetails.length})</span>
          </button>
          {showDishIngredients && (
            <div className="mt-2 space-y-1">
              {dishDetails.map((ingredient: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-2 py-1 bg-muted/2 rounded text-xs"
                >
                  <span className="flex items-center gap-1.5">
                    <Component className="w-3 h-3 text-blue-500" />
                    <span className="text-foreground">{ingredient.name}</span>
                  </span>
                  <span className="text-muted-foreground font-medium">{ingredient.weight}г</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SortableItem: React.FC<{
  id: string;
  index: number;
  item: any;
  products: Product[];
  dishes: Dish[];
  onRemove: (index: number) => void;
  onUpdateWeight: (index: number, weight: number) => void;
  onEditItem: (item: any) => void;
}> = ({ id, index, item, products, dishes, onRemove, onUpdateWeight, onEditItem }) => {
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

const MealForm: React.FC<MealFormProps> = ({ meal, onSubmit, onCancel, defaultName }) => {
  const { products } = useProductStore();
  const { dishes } = useDishStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showNutritionSummary, setShowNutritionSummary] = useState(true);
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
    let defaultWeight = undefined;
    if (type === 'product') {
      const product = products.find((p) => p.id === itemId);
      defaultWeight = product && product.portions.length > 0 ? product.portions[0].weight : 100;
    }
    append({
      instanceId: `${type}-${Date.now()}`,
      type,
      itemId,
      weight: type === 'product' ? defaultWeight : undefined,
    });
    setShowAddMenu(false);
    setSearchQuery('');
  };

  const updateItemWeight = (index: number, weight: number) => {
    const updatedItem = { ...watchItems[index], weight };
    update(index, updatedItem);
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
      items: watchItems.map(({ instanceId, ...item }) => item) as MealPlanItem[],
    };
    onSubmit(mealData);
  };

  const itemCounts = useMemo(() => {
    const counts = { products: 0, dishes: 0 };
    watchItems.forEach((item) => {
      if (item.type === 'product') counts.products++;
      else counts.dishes++;
    });
    return counts;
  }, [watchItems]);

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
                  <SortableItem
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
                  <div
                    className="bg-card border-2 border-primary rounded-lg p-3 shadow-2xl"
                    style={{
                      transform: 'rotate(2deg)',
                      cursor: 'grabbing',
                    }}
                  >
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
            {meal ? 'Сохранить изменения' : 'Создать прием пищи'}
          </Button>
        </div>
      </div>
    </>
  );
};

export default MealForm;
