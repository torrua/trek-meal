// src/components/meals/MealDetail.tsx

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import type { Meal, Product, Dish } from '../../types';
import useProductStore from '../../stores/useProductStore';
import useDishStore from '../../stores/useDishStore';
import Button from '../../ui/Button';
import MealForm from './MealForm';
import { useMealStore } from '../../stores/useMealStore';
import { calculateNutrition } from './mealFormUtils';

interface MealDetailProps {
  meal: Meal | null;
  onEdit: () => void;
  /** Optional numeric trigger that, when changed, will start inline editing */
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
}

// Read-only version of ItemContent
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
}) => {
  return (
    <div
      className={`bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} border border-border rounded-xl overflow-hidden`}
    >
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
        <div className="flex items-center gap-2">
          {actionButton}
          {headerContent}
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>
      {isOpen && <div className="p-6 pt-0">{children}</div>}
    </div>
  );
};

const ItemContentReadOnly: React.FC<{
  item: any;
  products: Product[];
  dishes: Dish[];
  navigate: (path: string) => void;
}> = ({ item, products, dishes, navigate }) => {
  const [showDishIngredients, setShowDishIngredients] = useState(false);

  const selectedItem =
    item.type === 'product'
      ? products.find((p) => p.id === item.itemId)
      : dishes.find((d) => d.id === item.itemId);

  const nutrition = useMemo(() => {
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
  }, [item, products, dishes]);

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

  const portion = useMemo(() => {
    if (item.type !== 'product' || !item.weight || !selectedItem) return null;
    return (selectedItem as Product).portions?.find((p) => p.weight === item.weight);
  }, [item.type, item.weight, selectedItem]);

  const isProduct = item.type === 'product';
  const isDish = item.type === 'dish';

  const handleClick = () => {
    if (isProduct) {
      navigate(`/products?selectedId=${item.itemId}`);
    } else {
      navigate(`/dishes?selectedId=${item.itemId}`);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header: Title + КБЖУ */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isProduct ? (
            <Component className="w-4 h-4 text-blue-500 flex-shrink-0" />
          ) : (
            <Soup className="w-4 h-4 text-orange-500 flex-shrink-0" />
          )}
          <h4
            className="font-medium text-foreground truncate hover:text-primary cursor-pointer transition-colors"
            onClick={handleClick}
          >
            {selectedItem?.name}
          </h4>
        </div>
        {nutrition && (
          <div className="flex items-center gap-2 h-8 px-2.5 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-orange-600">{nutrition.calories}</span>
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
            {item.weight && (
              <>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-1">
                  <Weight className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-muted-foreground">{item.weight}</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Weight Display - only shown for products */}
      {isProduct && item.weight && (
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 px-3 py-2 text-sm bg-card border border-border rounded-lg">
            <Weight className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">
              {portion ? portion.name : 'Другая порция'}
            </span>
            <span className="text-muted-foreground">({item.weight} г)</span>
          </div>
        </div>
      )}

      {/* Dish Ingredients */}
      {isDish && dishDetails && dishDetails.length > 0 && (
        <div className="pt-2 border-t border-border/50">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDishIngredients(!showDishIngredients);
            }}
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
                  className="flex items-center justify-between px-2 py-1 bg-muted/20 rounded text-xs"
                >
                  <span className="flex items-center gap-1.5">
                    <Component className="w-3 h-3 text-blue-500" />
                    <span className="text-foreground">{ingredient.name}</span>
                  </span>
                  <span className="text-muted-foreground font-medium text-xs">
                    <Weight className="w-3 h-3 inline mr-1" />
                    {ingredient.weight}
                  </span>
                </div>
              ))}
            </div>
          )}
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
  editSubmitTrigger,
  editCancelTrigger,
}) => {
  const { products } = useProductStore();
  const { dishes } = useDishStore();
  const navigate = useNavigate();
  const { updateMeal } = useMealStore();
  const [isEditing, setIsEditing] = useState(false);
  const editTriggerRef = useRef<number | undefined>(undefined);

  // If parent provides editTrigger prop, start editing when it changes
  useEffect(() => {
    if (typeof editTrigger === 'number') {
      if (editTriggerRef.current !== undefined && editTriggerRef.current !== editTrigger) {
        setIsEditing(true);
        // notify parent that editing started
        onStartEdit?.();
      }
      editTriggerRef.current = editTrigger;
    }
  }, [editTrigger]);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isEditing && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isEditing]);

  const watchItems = meal?.items || [];

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

  if (!meal) return null;

  // Don't early-return here because hooks below must run in the same order.

  const isBasicInfoOpen = openSections.includes('basic-info');
  const isCompositionOpen = openSections.includes('composition');

  const handleStartEdit = () => {
    // ensure basic-info section is open
    if (!openSections.includes('basic-info')) onToggleSection('basic-info');
    setIsEditing(true);
    onStartEdit?.();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    onFinishEdit?.();
  };

  const handleSave = (data: { name: string; description?: string; items: any[] }) => {
    if (!meal) return;
    updateMeal(meal.id, data);
    setIsEditing(false);
    onFinishEdit?.();
  };

  return (
    <div className="space-y-6 pl-1" ref={containerRef}>
      {isEditing && meal ? (
        // When editing, replace the read-only sections with the inline form
        <div className="mt-0 transition-all duration-200 ease-in-out">
          <MealForm
            meal={meal}
            onSubmit={handleSave}
            onCancel={handleCancelEdit}
            inline
            focusName
            externalSubmitTrigger={editSubmitTrigger}
            externalCancelTrigger={editCancelTrigger}
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
              {/* Name - read only */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Название приёма пищи
                </label>
                <div className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-lg text-sm text-foreground">
                  {meal.name}
                </div>
              </div>

              {/* Description - read only */}
              {meal.description && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Краткое описание
                  </label>
                  <div className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-lg text-sm text-foreground whitespace-pre-wrap">
                    {meal.description}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            id="composition"
            title="Состав"
            icon={<Utensils className="w-4 h-4 text-primary" />}
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
                <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-600" />
                      <span className="font-semibold text-orange-600">
                        {totalNutrition.calories}
                      </span>
                    </div>
                    <div className="w-px h-4 bg-border" />
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
                      {watchItems.reduce(
                        (total, item) => total + (item.type === 'product' ? item.weight : 0),
                        0
                      )}
                    </span>
                  </div>
                </div>
              )
            }
            gradientFrom="from-orange-500/5"
            gradientVia="via-yellow-500/5"
            gradientTo="to-green-500/5"
          >
            <div className="space-y-4 pt-4">
              <div className="space-y-3">
                {watchItems.length > 0 ? (
                  watchItems.map((item, index) => {
                    const isProduct = item.type === 'product';
                    const bgColor = isProduct
                      ? 'bg-blue-500/5 hover:bg-blue-500/10'
                      : 'bg-orange-500/5 hover:bg-orange-500/10';
                    const borderColor = isProduct
                      ? 'border-blue-500/20 hover:border-blue-500/40'
                      : 'border-orange-500/20 hover:border-orange-500/40';

                    return (
                      <div
                        key={item.instanceId || `${item.type}-${item.itemId}-${index}`}
                        className={`${bgColor} border ${borderColor} rounded-lg p-3 transition-all duration-200 hover:shadow-sm`}
                      >
                        <ItemContentReadOnly
                          item={item}
                          products={products}
                          dishes={dishes}
                          navigate={navigate}
                        />
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
