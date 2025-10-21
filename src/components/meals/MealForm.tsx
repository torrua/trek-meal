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
  Eye,
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
  DragStartEvent,
  DragEndEvent,
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

const SortableItem: React.FC<{
  id: string;
  index: number;
  item: any;
  products: Product[];
  dishes: Dish[];
  onRemove: (index: number) => void;
  onUpdateWeight: (index: number, weight: number) => void;
  onQuickView: (item: any) => void;
  onEditItem: (item: any) => void;
  isDragging: boolean;
}> = ({
  id,
  index,
  item,
  products,
  dishes,
  onRemove,
  onUpdateWeight,
  onQuickView,
  onEditItem,
  isDragging,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id });
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [customWeight, setCustomWeight] = useState(item.weight?.toString() || '');
  const [showPortions, setShowPortions] = useState(false);
  const [showDishIngredients, setShowDishIngredients] = useState(false);
  const [itemHeight, setItemHeight] = useState<number | null>(null);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (itemRef.current) {
      const height = itemRef.current.offsetHeight;
      setItemHeight(height);
    }
  }, [isEditingWeight, showDishIngredients]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isSortableDragging ? transition : undefined,
    height: isSortableDragging && itemHeight ? `${itemHeight}px` : 'auto',
    overflow: isSortableDragging ? 'hidden' : 'visible',
  };

  const selectedItem =
    item.type === 'product'
      ? products.find((p) => p.id === item.itemId)
      : dishes.find((d) => d.id === item.itemId);
  const nutrition = calculateNutrition(item, products, dishes);

  // Get dish details if it's a dish
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

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (node) itemRef.current = node;
      }}
      style={style}
      className={`bg-card border border-border rounded-lg p-3 transition-all ${isSortableDragging ? 'opacity-50 shadow-lg z-50' : ''}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {item.type === 'product' ? (
            <Component className="w-4 h-4 text-blue-500 flex-shrink-0" />
          ) : (
            <Soup className="w-4 h-4 text-orange-500 flex-shrink-0" />
          )}
          <h4 className="font-medium text-foreground truncate">{selectedItem?.name}</h4>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onQuickView(item)}
            className="h-8 w-8 bg-primary/10 hover:bg-primary/20 text-primary flex-shrink-0"
            title="Быстрый просмотр"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onEditItem(item)}
            className="h-8 w-8 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 flex-shrink-0"
            title="Редактировать"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="h-8 w-8 bg-danger/10 hover:bg-danger/20 text-danger flex-shrink-0"
            title="Удалить"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {item.type === 'product' && (
          <>
            {!isEditingWeight ? (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onUpdateWeight(index, Math.max(10, (item.weight || 100) - 10))}
                  className="h-8 w-8 bg-muted hover:bg-muted/80"
                >
                  <span className="text-lg font-semibold">-</span>
                </Button>
                <button
                  type="button"
                  onClick={() => setShowPortions(!showPortions)}
                  className="min-w-[200px] px-3 py-1.5 text-sm bg-background border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Scale className="w-3.5 h-3.5" />
                    <span className="font-medium">
                      {currentPortion ? currentPortion.name : 'Другой'}
                    </span>
                  </span>
                  <span className="text-muted-foreground">({item.weight} г)</span>
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setCustomWeight(item.weight?.toString() || '');
                    setIsEditingWeight(true);
                  }}
                  className="h-8 w-8 bg-muted hover:bg-muted/80"
                  title="Указать вес вручную"
                >
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onUpdateWeight(index, (item.weight || 100) + 10)}
                  className="h-8 w-8 bg-muted hover:bg-muted/80"
                >
                  <span className="text-lg font-semibold">+</span>
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
          </>
        )}
        {nutrition && (
          <div className="flex items-center gap-3 flex-wrap ml-auto">
            <div className="flex items-center gap-1.5 text-sm">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-semibold">{nutrition.calories}</span>
              <span className="text-muted-foreground text-xs">ккал</span>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Beef className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-semibold text-blue-600">Б: {nutrition.proteins}г</span>
              </div>
              <div className="flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-yellow-500" />
                <span className="font-semibold text-yellow-600">Ж: {nutrition.fats}г</span>
              </div>
              <div className="flex items-center gap-1">
                <Wheat className="w-3.5 h-3.5 text-green-500" />
                <span className="font-semibold text-green-600">У: {nutrition.carbs}г</span>
              </div>
            </div>
          </div>
        )}
        {showPortions && portions.length > 0 && (
          <div className="absolute z-10 mt-1 w-80 bg-card border border-border rounded-lg shadow-lg py-1 max-h-60 overflow-auto">
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

      {/* Dish Ingredients Collapsible */}
      {item.type === 'dish' && dishDetails && dishDetails.length > 0 && (
        <div className="mt-2 border-t border-border pt-2">
          <button
            type="button"
            onClick={() => setShowDishIngredients(!showDishIngredients)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown
              className={`w-3 h-3 transition-transform ${showDishIngredients ? 'rotate-180' : ''}`}
            />
            <span>Состав блюда ({dishDetails.length})</span>
          </button>
          {showDishIngredients && (
            <div className="mt-2 space-y-1">
              {dishDetails.map((ingredient: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-2 py-1 bg-muted/30 rounded text-xs"
                >
                  <span className="flex items-center gap-1">
                    <Component className="w-3 h-3 text-blue-500" />
                    {ingredient.name}
                  </span>
                  <span className="text-muted-foreground">{ingredient.weight}г</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {nutrition && (
        <div className="flex sm:hidden items-center gap-3 text-xs mt-2">
          <div className="flex items-center gap-1">
            <Beef className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-semibold text-blue-600">Б: {nutrition.proteins}г</span>
          </div>
          <div className="flex items-center gap-1">
            <Droplet className="w-3.5 h-3.5 text-yellow-500" />
            <span className="font-semibold text-yellow-600">Ж: {nutrition.fats}г</span>
          </div>
          <div className="flex items-center gap-1">
            <Wheat className="w-3.5 h-3.5 text-green-500" />
            <span className="font-semibold text-green-600">У: {nutrition.carbs}г</span>
          </div>
        </div>
      )}
    </div>
  );
};

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
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Beef className="w-3 h-3 text-blue-500" />
                    <span className="text-blue-600">Белки:</span>
                  </div>
                  <span className="font-semibold">{nutrition.proteins}г</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Droplet className="w-3 h-3 text-yellow-500" />
                    <span className="text-yellow-600">Жиры:</span>
                  </div>
                  <span className="font-semibold">{nutrition.fats}г</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Wheat className="w-3 h-3 text-green-500" />
                    <span className="text-green-600">Углев.:</span>
                  </div>
                  <span className="font-semibold">{nutrition.carbs}г</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {item.type === 'product' && selectedItem && (selectedItem as Product).portions && (
          <div>
            <h4 className="text-sm font-medium mb-2">Доступные порции:</h4>
            <div className="space-y-1">
              {(selectedItem as Product).portions.map((portion: ProductPortion, idx: number) => (
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
  const navigate = useNavigate();
  const [quickViewItem, setQuickViewItem] = useState<any>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggingId, setDraggingId] = useState<string | null>(null);

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
      name: meal?.name || '',
      description: meal?.description || '',
      items: meal?.items || [],
    },
  });
  const { fields, append, remove, move, update } = useFieldArray({ control, name: 'items' });
  const watchItems = watch('items');

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

  const sensors = useSensors(useSensor(PointerSensor));
  const handleDragStart = (event: DragStartEvent) => {
    setDraggingId(event.active.id as string);
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggingId(null);
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

  return (
    <>
      <div className="space-y-6 p-1">
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
                <Beef className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-blue-600">{totalNutrition.proteins}</p>
                <p className="text-xs text-muted-foreground">г белков</p>
              </div>
              <div className="text-center p-3 bg-card rounded-lg">
                <Droplet className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-yellow-600">{totalNutrition.fats}</p>
                <p className="text-xs text-muted-foreground">г жиров</p>
              </div>
              <div className="text-center p-3 bg-card rounded-lg">
                <Wheat className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-green-600">{totalNutrition.carbs}</p>
                <p className="text-xs text-muted-foreground">г углев.</p>
              </div>
            </div>
          </div>
        )}

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

          <div className="relative mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="w-full border-2 border-dashed hover:border-primary hover:bg-primary/5"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить продукт или блюдо
              <ChevronDown className="w-3 h-3 ml-auto" />
            </Button>

            {showAddMenu && (
              <div className="absolute z-10 w-full mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                <div className="sticky top-0 bg-card p-3 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Поиск продуктов и блюд..."
                      className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="p-2">
                  {filteredProducts.length === 0 && filteredDishes.length === 0 ? (
                    <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                      Ничего не найдено
                    </div>
                  ) : (
                    <>
                      {filteredProducts.length > 0 && (
                        <div className="mb-2">
                          <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                            <Component className="w-3.5 h-3.5 text-blue-500" />
                            Продукты ({filteredProducts.length})
                          </div>
                          {filteredProducts.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => handleAddItem(product.id, 'product')}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                            >
                              <Component className="w-3.5 h-3.5 text-blue-500" />
                              {product.name}
                            </button>
                          ))}
                        </div>
                      )}
                      {filteredDishes.length > 0 && (
                        <div>
                          <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                            <Soup className="w-3.5 h-3.5 text-orange-500" />
                            Блюда ({filteredDishes.length})
                          </div>
                          {filteredDishes.map((dish) => (
                            <button
                              key={dish.id}
                              type="button"
                              onClick={() => handleAddItem(dish.id, 'dish')}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                            >
                              <Soup className="w-3.5 h-3.5 text-orange-500" />
                              {dish.name}
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
                    onQuickView={setQuickViewItem}
                    onEditItem={handleEditItem}
                    isDragging={draggingId === field.id}
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
