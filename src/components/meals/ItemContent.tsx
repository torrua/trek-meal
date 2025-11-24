// src/components/meals/ItemContent.tsx

import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  Component,
  Soup,
  Flame,
  Beef,
  Droplet,
  Wheat,
  Weight,
  ChevronDown,
  Edit,
  Check,
  X,
  Trash2,
  PieChart,
  Circle,
} from 'lucide-react';
import type { Product, Dish, ProductPortion } from '../../types';
import Button from '../../ui/Button';

interface ItemContentProps {
  item: any;
  products: Product[];
  dishes: Dish[];
  onRemove?: () => void;
  onUpdateWeight?: (weight: number) => void;
  onEditItem?: () => void;
  showActions?: boolean;
}

const ItemContent: React.FC<ItemContentProps> = ({
  item,
  products,
  dishes,
  onRemove,
  onUpdateWeight,
  onEditItem,
  showActions = true,
}) => {
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [customWeight, setCustomWeight] = useState(item.weight?.toString() || '');
  const [showPortions, setShowPortions] = useState(false);
  const [showDishIngredients, setShowDishIngredients] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const portionDropdownRef = useRef<HTMLDivElement>(null);

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

  const dishWeight = useMemo(() => {
    if (item.type !== 'dish' || !selectedItem) return 0;
    const dish = selectedItem as Dish;
    return dish.products.reduce((sum, dp) => sum + dp.weight, 0);
  }, [item.type, selectedItem]);

  const displayWeight = isProduct ? item.weight : dishWeight;

  const CurrentPortionIcon = currentPortion?.isIndivisible ? Circle : PieChart;

  return (
    <div className="space-y-3">
      {/* Header: Title + Expandable КБЖУ + Actions */}
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
            {nutrition && displayWeight && (
              <button
                onClick={() => setShowNutrition(!showNutrition)}
                className="flex items-center gap-1.5 h-8 px-2.5 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-all"
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
                      <span className="text-sm font-semibold text-yellow-600">
                        {nutrition.fats}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wheat className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-600">
                        {nutrition.carbs}
                      </span>
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

      {/* Weight Display - only shown for products */}
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
                    {/* 3. Использование динамической иконки в кнопке */}
                    <CurrentPortionIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-muted-foreground">
                      {currentPortion ? currentPortion.name : 'Другой'}
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">({item.weight})</span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform ${showPortions ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>
                {showPortions && portions.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-card border border-border rounded-lg shadow-lg py-1 max-h-60 overflow-auto">
                    {portions.map((portion: ProductPortion, idx: number) => {
                      // 4. Определение иконки для каждого элемента списка
                      const OptionIcon = portion.isIndivisible ? Circle : PieChart;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePortionSelect(portion)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between ${portion.weight === item.weight ? 'bg-primary/10 text-primary' : ''}`}
                        >
                          <span className="flex items-center gap-2">
                            <OptionIcon className="w-3 h-3 opacity-70" />
                            <span className="font-medium">{portion.name}</span>
                          </span>
                          <span className="text-muted-foreground text-sm">{portion.weight}</span>
                        </button>
                      );
                    })}
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
              <input
                type="number"
                value={customWeight}
                onChange={(e) => setCustomWeight(e.target.value)}
                placeholder="Вес в граммах"
                className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
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
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleCustomWeightSave}
                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600"
                title="Подтвердить"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setCustomWeight(item.weight?.toString() || '');
                  setIsEditingWeight(false);
                }}
                title="Отмена"
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
        </div>
      )}
    </div>
  );
};

export default ItemContent;
