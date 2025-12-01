// src/components/meals/MealDetail.tsx

import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  Info,
  Utensils,
  Hash,
  Component,
  Soup,
  Flame,
  Beef,
  Droplet,
  Wheat,
  Weight,
  Edit,
  ChevronDown,
  PieChart,
  Circle,
} from 'lucide-react';
import type { Meal, Product, Dish, MealPlanItem } from '../../types';
import useProductStore from '../../stores/useProductStore';
import useDishStore from '../../stores/useDishStore';
import Button from '../../ui/Button';
import MealForm from './MealForm';
import { useMealStore } from '../../stores/useMealStore';
import { calculateNutrition } from './mealFormUtils';

interface MealDetailProps {
  meal: Meal | null;
  onEdit: () => void;
  editTrigger?: number;
  openSections: string[];
  onToggleSection: (sectionId: string) => void;
  onStartEdit?: () => void;
  onFinishEdit?: () => void;
  editSubmitTrigger?: number;
  editCancelTrigger?: number;
}

interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: (id: string) => void;
  actionButton?: React.ReactNode;
  summaryContent?: React.ReactNode;
  headerContent?: React.ReactNode;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  className?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  id,
  title,
  icon,
  children,
  isOpen,
  onToggle,
  actionButton,
  summaryContent,
  headerContent,
  gradientFrom = 'from-blue-500/5',
  gradientVia = 'via-purple-500/5',
  gradientTo = 'to-pink-500/5',
  className,
}) => {
  // Определяем тень как константу, чтобы использовать везде
  const defaultShadow = 'shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)]';

  return (
    <div
      // Применяем defaultShadow ко всем блокам
      // Если className передан, используем его, иначе стандартный border
      className={`${className || 'border border-border'} ${defaultShadow} rounded-xl relative transform`}
    >
      <div
        className={`bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} rounded-xl absolute inset-0`}
      ></div>
      <div className="relative">
        <div
          className="flex items-center justify-between gap-3 p-6 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onToggle(id)}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
              {icon}
            </div>
            <h2 className="text-lg font-semibold truncate">{title}</h2>
            {summaryContent && <div className="ml-2 flex-shrink-0">{summaryContent}</div>}
          </div>
          <div className="flex items-center gap-2 min-w-[200px] justify-end">
            {actionButton}
            {headerContent}
          </div>
        </div>
        {isOpen && <div className="p-6 pt-0">{children}</div>}
      </div>
    </div>
  );
};

const ItemContentReadOnly: React.FC<{
  item: MealPlanItem;
  products: Product[];
  dishes: Dish[];
}> = ({ item, products, dishes }) => {
  const [showDishIngredients, setShowDishIngredients] = useState(false);
  const [showProductPortion, setShowProductPortion] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);

  const selectedItem =
    item.type === 'product'
      ? products.find((p) => p.id === item.itemId)
      : dishes.find((d) => d.id === item.itemId);

  const nutrition = useMemo(() => {
    if (item.type === 'product') {
      const product = products.find((p) => p.id === item.itemId);
      if (!product || !item.weight) return null;
      const multiplier = Number(item.weight) / 100;
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
          const weightRatio = Number(dishProduct.weight) / 100;
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
  }, [item, products, dishes]);

  const dishDetails = useMemo(() => {
    if (item.type !== 'dish' || !selectedItem) return null;
    const dish = selectedItem as Dish;
    return dish.products
      .map((dp) => {
        const product = products.find((p) => p.id === dp.productId);
        if (!product) return null;

        // Находим соответствующую порцию
        const portion = product.portions?.find((p) => Number(p.weight) === Number(dp.weight));
        const PortionIcon = portion?.isIndivisible ? Circle : PieChart;

        return {
          name: product.name,
          weight: dp.weight,
          icon: PortionIcon,
        };
      })
      .filter(
        (
          ingred
        ): ingred is { name: string; weight: number; icon: typeof PieChart | typeof Circle } =>
          ingred !== null
      );
  }, [item.type, selectedItem, products]);

  const portion = useMemo(() => {
    if (item.type !== 'product' || !('weight' in item) || !item.weight || !selectedItem)
      return null;
    return (selectedItem as Product).portions?.find(
      (p) => Number(p.weight) === Number(item.weight)
    );
  }, [item, selectedItem]);

  const portions = useMemo(() => {
    if (item.type !== 'product' || !selectedItem) return [];
    return (selectedItem as Product).portions || [];
  }, [item.type, selectedItem]);

  const CurrentPortionIcon = portion?.isIndivisible ? Circle : PieChart;

  const isProduct = item.type === 'product';
  const isDish = item.type === 'dish';

  // Calculate dish weight
  const dishWeight = useMemo(() => {
    if (item.type !== 'dish' || !selectedItem) return 0;
    const dish = selectedItem as Dish;
    return Number(dish.products.reduce((sum, dp) => sum + Number(dp.weight), 0));
  }, [item.type, selectedItem]);

  const displayWeight = isProduct ? Number(item.weight) : Number(dishWeight);

  return (
    <div
      className={`space-y-1 ${(isDish && dishDetails && dishDetails.length > 0) || (isProduct && portions && portions.length > 0) ? 'cursor-pointer' : ''}`}
      onClick={() => {
        if (isDish && dishDetails && dishDetails.length > 0) {
          setShowDishIngredients(!showDishIngredients);
        }
        if (isProduct && portions && portions.length > 0) {
          setShowProductPortion(!showProductPortion);
        }
      }}
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isProduct ? (
            <Component className="w-4 h-4 text-blue-500 flex-shrink-0" />
          ) : (
            <Soup className="w-4 h-4 text-orange-500 flex-shrink-0" />
          )}
          <h4 className="font-medium text-foreground truncate">{selectedItem?.name}</h4>
        </div>
        <div className="flex items-center gap-2">
          {nutrition && displayWeight && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNutrition(!showNutrition);
              }}
              className="flex items-center gap-1.5 h-8 px-2.5 bg-muted/50 rounded-md border border-border hover:bg-muted transition-all"
            >
              {showNutrition ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground -rotate-90 transition-transform" />
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-semibold text-orange-600">
                      {nutrition.calories}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-1">
                    <Beef className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-600">
                      {nutrition.proteins}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplet className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-semibold text-yellow-600">{nutrition.fats}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wheat className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-600">{nutrition.carbs}</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-1">
                    <Weight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-muted-foreground">
                      {displayWeight}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground rotate-90 transition-transform" />
                  <div className="flex items-center gap-1">
                    <Weight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-muted-foreground">
                      {displayWeight}
                    </span>
                  </div>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {isProduct && portions && portions.length > 0 && item.weight && showProductPortion && (
        <div className="pt-2">
          <div className="flex items-center justify-between px-3 h-8 bg-card border border-border rounded-md text-sm">
            <span className="flex items-center gap-1.5">
              <CurrentPortionIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground font-medium text-sm">
                {portion ? portion.name : 'Другой'}
              </span>
            </span>
            <span className="text-muted-foreground font-medium text-sm flex items-center gap-1">
              <Weight className="w-3.5 h-3.5" />
              {item.weight}
            </span>
          </div>
        </div>
      )}

      {isDish && dishDetails && dishDetails.length > 0 && showDishIngredients && (
        <div className="pt-2 space-y-1">
          {dishDetails.map((ingredient, idx: number) => {
            const IconComponent = ingredient.icon;
            return (
              <div
                key={idx}
                className="flex items-center justify-between px-3 h-8 bg-card border border-border rounded-md text-sm"
              >
                <span className="flex items-center gap-1.5">
                  <IconComponent className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground font-medium text-sm">
                    {ingredient.name}
                  </span>
                </span>
                <span className="text-muted-foreground font-medium text-sm flex items-center gap-1">
                  <Weight className="w-3.5 h-3.5" />
                  {ingredient.weight}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const MealDetail: React.FC<MealDetailProps> = ({
  meal,
  onEdit: _onEdit,
  editTrigger,
  openSections,
  onToggleSection,
  onStartEdit,
  onFinishEdit,
  editSubmitTrigger: _editSubmitTrigger,
  editCancelTrigger: _editCancelTrigger,
}) => {
  const { products } = useProductStore();
  const { dishes } = useDishStore();
  const { updateMeal } = useMealStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showHeaderNutrition, setShowHeaderNutrition] = useState(false);
  const editTriggerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (typeof editTrigger === 'number') {
      if (editTriggerRef.current !== undefined && editTriggerRef.current !== editTrigger) {
        setIsEditing(true);
        onStartEdit?.();
      }
      editTriggerRef.current = editTrigger;
    }
  }, [editTrigger, onStartEdit]);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isEditing && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isEditing]);

  const watchItems = useMemo(() => meal?.items || [], [meal?.items]);

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

  // Helper function to calculate item weight consistently
  const calculateItemWeight = (item: MealPlanItem, products: Product[], dishes: Dish[]): number => {
    if (item.type === 'product') {
      return Number(item.weight || 0);
    } else if (item.type === 'dish') {
      const dish = dishes.find((d) => d.id === item.itemId);
      if (dish) {
        return Number(dish.products.reduce((sum, dp) => sum + Number(dp.weight), 0));
      }
    }
    return 0;
  };

  // Calculate total weight including dishes
  const totalWeight = useMemo(() => {
    return watchItems.reduce((total, item) => {
      return total + calculateItemWeight(item, products, dishes);
    }, 0);
  }, [watchItems, products, dishes]);

  if (!meal) return null;

  const isBasicInfoOpen = openSections.includes('basic-info');
  const isCompositionOpen = openSections.includes('composition');

  const handleStartEdit = () => {
    if (!openSections.includes('basic-info')) onToggleSection('basic-info');
    setIsEditing(true);
    onStartEdit?.();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    onFinishEdit?.();
  };

  const handleSave = (data: { name: string; description?: string; items: MealPlanItem[] }) => {
    if (!meal) return;
    updateMeal(meal.id, data);
    setIsEditing(false);
    onFinishEdit?.();
  };

  return (
    <div className="space-y-6 pl-1 pb-4" ref={containerRef}>
      {isEditing && meal ? (
        <div className="mt-0 transition-all duration-200 ease-in-out pl-1">
          <MealForm
            meal={meal}
            onSubmit={handleSave}
            onCancel={handleCancelEdit}
            focusName={true}
          />
        </div>
      ) : (
        <>
          <CollapsibleSection
            id="basic-info"
            title="Основная информация"
            icon={<Info className="w-4 h-4 text-primary" />}
            isOpen={isBasicInfoOpen}
            onToggle={onToggleSection}
            actionButton={
              <Button type="button" variant="primary" onClick={handleStartEdit} icon={Edit}>
                Редактировать
              </Button>
            }
            gradientFrom="from-blue-500/5"
            gradientVia="via-purple-500/5"
            gradientTo="to-pink-500/5"
          >
            <div className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Название приёма пищи
                </label>
                <div className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground">
                  {meal.name}
                </div>
              </div>

              {meal.description && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Краткое описание
                  </label>
                  <div className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground whitespace-pre-wrap">
                    {meal.description}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            id="composition"
            title="Состав"
            icon={<Utensils className="w-4 h-4 text-green-600" />}
            isOpen={isCompositionOpen}
            onToggle={onToggleSection}
            summaryContent={
              watchItems.length > 0 && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Hash className="w-3.5 h-3.5" />
                  {watchItems.length}
                </span>
              )
            }
            headerContent={
              watchItems.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHeaderNutrition(!showHeaderNutrition);
                  }}
                  className="flex items-center gap-1.5 px-3 h-9 bg-muted/50 rounded-md border border-border hover:bg-muted transition-all"
                >
                  {showHeaderNutrition ? (
                    <>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground -rotate-90 transition-transform" />
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-600" />
                          <span className="font-semibold text-orange-600">
                            {totalNutrition.calories}
                          </span>
                        </div>
                        <div className="w-px h-4 bg-border" />
                        <div className="flex items-center gap-1">
                          <Beef className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-blue-600">
                            {totalNutrition.proteins}
                          </span>
                        </div>
                        <div className="w-px h-4 bg-border" />
                        <div className="flex items-center gap-1">
                          <Droplet className="w-4 h-4 text-yellow-600" />
                          <span className="font-semibold text-yellow-600">
                            {totalNutrition.fats}
                          </span>
                        </div>
                        <div className="w-px h-4 bg-border" />
                        <div className="flex items-center gap-1">
                          <Wheat className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-600">
                            {totalNutrition.carbs}
                          </span>
                        </div>
                      </div>
                      <div className="w-px h-4 bg-border" />
                      <div className="flex items-center gap-1">
                        <Weight className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-muted-foreground text-sm">
                          {totalWeight}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground rotate-90 transition-transform" />
                      <div className="flex items-center gap-1">
                        <Weight className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-muted-foreground text-sm">
                          {totalWeight}
                        </span>
                      </div>
                    </>
                  )}
                </button>
              )
            }
            gradientFrom="from-orange-500/5"
            gradientVia="via-yellow-500/5"
            gradientTo="to-green-500/5"
            className="[background:var(--color-meal-composition-gradient)] border border-border"
          >
            <div className="space-y-4 pt-4">
              <div className="space-y-3">
                {watchItems.length > 0 ? (
                  watchItems.map((item, index) => {
                    const isProduct = item.type === 'product';
                    const itemStyle = isProduct
                      ? '[background:var(--color-product-gradient)] border border-[#3b82f6]/30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
                      : '[background:var(--color-dish-gradient)] border border-[#f97316]/30 shadow-[0_1px_2px_rgba(0,0,0,0.05)]';

                    return (
                      <div
                        key={item.instanceId || `${item.type}-${item.itemId}-${index}`}
                        className={`${itemStyle} rounded-xl transition-all duration-200 p-3 hover:bg-card-hover hover:shadow-[0_2px_4px_rgba(0,0,0,0.1)]`}
                      >
                        <ItemContentReadOnly item={item} products={products} dishes={dishes} />
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Пусто</p>
                    <p className="text-xs mt-1">Добавьте продукты или блюда</p>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleSection>
        </>
      )}
    </div>
  );
};

export default MealDetail;
