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
  Trash2,
  PieChart,
  Circle,
  SquareArrowOutUpRight,
} from 'lucide-react';
import type { Product, Dish, MealPlanItem, ProductPortion } from '../../types';
import Button from '../../ui/Button';

interface ItemContentProps {
  item: MealPlanItem;
  products: Product[];
  dishes: Dish[];
  onRemove?: () => void;
  onUpdateWeight?: (weight: number) => void;
  onEditItem?: () => void;
  showActions?: boolean;
  onEditDishIngredient?: (productId: number) => void;
  onRemoveDishIngredient?: (productId: number) => void;
  showCurrentPortion?: boolean;
  onTogglePortion?: () => void;
  dragHandleProps?: {
    attributes: React.HTMLAttributes<HTMLElement>;
    listeners: React.HTMLAttributes<HTMLElement>;
  };
}

const ItemContent: React.FC<ItemContentProps> = ({
  item,
  products,
  dishes,
  onRemove,
  onUpdateWeight: _onUpdateWeight,
  onEditItem,
  showActions = true,
  onEditDishIngredient,
  onRemoveDishIngredient,
  showCurrentPortion: propShowCurrentPortion = false,
  onTogglePortion,
  dragHandleProps,
}) => {
  // Фильтруем только совместимые с SVG свойства из dnd-kit listeners
  const svgCompatibleListeners = dragHandleProps?.listeners
    ? {
        onMouseDown: dragHandleProps.listeners.onMouseDown,
        onTouchStart: dragHandleProps.listeners.onTouchStart,
        onTouchEnd: dragHandleProps.listeners.onTouchEnd,
      }
    : {};

  const [showPortionDropdown, setShowPortionDropdown] = useState(false); // Показывать dropdown с выбором
  const [showDishIngredients, setShowDishIngredients] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const portionDropdownRef = useRef<HTMLDivElement>(null);
  const portionButtonRef = useRef<HTMLDivElement>(null);

  const selectedItem =
    item.type === 'product'
      ? products.find((p) => p.id === item.itemId)
      : dishes.find((d) => d.id === item.itemId);

  const nutrition = useMemo(() => {
    if (item.type === 'product') {
      const product = products.find((p) => p.id === item.itemId);
      if (!product) return null;
      const weight = Number(item.weight || 100);
      const multiplier = weight / 100;
      return {
        calories: Math.round(product.calories * multiplier),
        proteins: Math.round(product.proteins * multiplier * 10) / 10,
        fats: Math.round(product.fats * multiplier * 10) / 10,
        carbs: Math.round(product.carbs * multiplier * 10) / 10,
      };
    }
    if (item.type === 'dish') {
      let totalCalories = 0;
      let totalProteins = 0;
      let totalFats = 0;
      let totalCarbs = 0;
      const dish = selectedItem as Dish;
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
  }, [item, products, selectedItem]);

  // Обновление позиции dropdown при открытии
  useEffect(() => {
    if (showPortionDropdown && portionButtonRef.current) {
      const updatePosition = () => {
        const rect = portionButtonRef.current?.getBoundingClientRect();
        if (!rect) return;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        setDropdownPosition({
          top: rect.bottom + scrollTop + 4,
          left: rect.left + scrollLeft,
          width: rect.width,
        });
      };

      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [showPortionDropdown]);

  // Закрытие dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        portionDropdownRef.current &&
        !portionDropdownRef.current.contains(event.target as Node) &&
        portionButtonRef.current &&
        !portionButtonRef.current.contains(event.target as Node)
      ) {
        setShowPortionDropdown(false);
      }
    };

    if (showPortionDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPortionDropdown]);

  const dishDetails = useMemo(() => {
    if (item.type !== 'dish' || !selectedItem) return null;
    const dish = selectedItem as Dish;
    return dish.products
      .map((dp) => {
        const product = products.find((p) => p.id === dp.productId);
        if (!product) return null;

        const portion = product.portions?.find((p) => p.weight === dp.weight);
        const PortionIcon = portion?.isIndivisible ? Circle : PieChart;

        return {
          name: product.name,
          weight: dp.weight,
          icon: PortionIcon,
        };
      })
      .filter(
        (
          ingredient
        ): ingredient is { name: string; weight: number; icon: typeof PieChart | typeof Circle } =>
          ingredient !== null
      );
  }, [item.type, selectedItem, products]);

  const isProduct = item.type === 'product';
  const isDish = item.type === 'dish';

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

  const dishWeight = useMemo(() => {
    return calculateItemWeight(item, products, dishes);
  }, [item, products, dishes]);

  const displayWeight = isProduct ? Number(item.weight || 100) : Number(dishWeight);

  const portions = useMemo(() => {
    if (item.type !== 'product' || !selectedItem) return [];
    return (selectedItem as Product).portions || [];
  }, [item.type, selectedItem]);

  const currentPortion = useMemo(() => {
    if (item.type !== 'product' || !item.weight) return null;
    const weight = Number(item.weight);
    const foundPortion = portions.find((p: ProductPortion) => Number(p.weight) === weight);
    return foundPortion;
  }, [item, portions]);

  const handlePortionSelect = (portion: ProductPortion, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    if (_onUpdateWeight) _onUpdateWeight(portion.weight);
    setShowPortionDropdown(false);
  };

  return (
    <div className="space-y-1">
      {/* Header: Title + Expandable КБЖУ + Actions */}
      <div className="flex items-center gap-2">
        {/* Кликабельная область заголовка */}
        <div
          className={`flex items-center gap-2 flex-1 min-w-0 ${
            (isDish && dishDetails && dishDetails.length > 0) ||
            (isProduct && portions && portions.length > 0)
              ? 'cursor-pointer'
              : ''
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (isDish && dishDetails && dishDetails.length > 0) {
              setShowDishIngredients(!showDishIngredients);
            }
            if (isProduct && portions && portions.length > 0) {
              onTogglePortion?.();
            }
          }}
        >
          {isProduct ? (
            <Component
              className="w-4 h-4 text-navy-500 flex-shrink-0 cursor-grab active:cursor-grabbing outline-none focus:outline-none"
              role="button"
              tabIndex={0}
              {...svgCompatibleListeners}
            />
          ) : (
            <Soup
              className="w-4 h-4 text-autumn-leaf-500 flex-shrink-0 cursor-grab active:cursor-grabbing outline-none focus:outline-none"
              role="button"
              tabIndex={0}
              {...svgCompatibleListeners}
            />
          )}
          <h4 className="font-medium text-foreground truncate">{selectedItem?.name}</h4>
        </div>

        {/* Nutrition block - always shown for products and dishes */}
        {(nutrition || (isProduct && selectedItem && displayWeight && displayWeight > 0)) && (
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
                    {nutrition
                      ? nutrition.calories
                      : isProduct && selectedItem
                        ? Math.round((selectedItem as Product).calories * (displayWeight / 100))
                        : 0}
                  </span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-1">
                  <Beef className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-600">
                    {nutrition
                      ? nutrition.proteins
                      : isProduct && selectedItem
                        ? Math.round(
                            (selectedItem as Product).proteins * (displayWeight / 100) * 10
                          ) / 10
                        : 0}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Droplet className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-600">
                    {nutrition
                      ? nutrition.fats
                      : isProduct && selectedItem
                        ? Math.round((selectedItem as Product).fats * (displayWeight / 100) * 10) /
                          10
                        : 0}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Wheat className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">
                    {nutrition
                      ? nutrition.carbs
                      : isProduct && selectedItem
                        ? Math.round((selectedItem as Product).carbs * (displayWeight / 100) * 10) /
                          10
                        : 0}
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
        {showActions && (
          <div className="flex items-center gap-2">
            {onEditItem && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditItem();
                }}
                className="!border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/15 text-blue-600"
                title="Открыть блюдо"
              >
                <SquareArrowOutUpRight className="w-4 h-4" />
              </Button>
            )}
            {onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="!border-danger/20 bg-danger/10 hover:bg-danger/15 text-danger"
                title="Удалить"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Portion selector - only shown for products when showCurrentPortion is true */}
      {isProduct && portions && portions.length > 0 && propShowCurrentPortion && (
        <div className="pt-2">
          <div className="relative flex-1">
            <div
              ref={portionButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                setShowPortionDropdown(!showPortionDropdown);
              }}
              className="flex items-center px-3 h-8 text-sm bg-card border border-border rounded-md hover:bg-muted hover:border-primary/30 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-1.5 flex-1">
                {currentPortion ? (
                  currentPortion.isIndivisible ? (
                    <Circle className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <PieChart className="w-3.5 h-3.5 text-muted-foreground" />
                  )
                ) : (
                  <Component className="w-3.5 h-3.5 text-muted-foreground" />
                )}
                <span className="font-medium text-muted-foreground text-sm">
                  {currentPortion ? currentPortion.name : 'Другой'}
                </span>
              </span>
              <ChevronDown
                className={`w-3 h-3 text-muted-foreground transition-transform mx-2 ${showPortionDropdown ? 'rotate-180' : ''}`}
              />
              <span className="text-muted-foreground font-medium text-sm flex items-center gap-1">
                <Weight className="w-3.5 h-3.5" />
                {item.weight}
              </span>
            </div>
            {showPortionDropdown && (
              <div
                ref={portionDropdownRef}
                className="fixed z-50 bg-card border border-border rounded-lg shadow-2xl py-0 max-h-60 overflow-auto"
                style={{
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${dropdownPosition.width}px`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {portions.map((portion: ProductPortion, idx: number) => {
                  const OptionIcon = portion.isIndivisible ? Circle : PieChart;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePortionSelect(portion, e);
                      }}
                      className={`w-full text-left px-3 h-8 text-sm hover:bg-muted transition-colors flex items-center justify-between rounded-md ${Number(portion.weight) === Number(item.weight) ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      <span className="flex items-center gap-2">
                        <OptionIcon className="w-3.5 h-3.5 opacity-70" />
                        <span className="font-medium text-muted-foreground text-sm">
                          {portion.name}
                        </span>
                      </span>
                      <span className="text-muted-foreground font-medium text-sm flex items-center gap-1">
                        <Weight className="w-3.5 h-3.5" />
                        {portion.weight}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dish Ingredients */}
      {isDish && dishDetails && dishDetails.length > 0 && showDishIngredients && (
        <div className="pt-2 space-y-1">
          {dishDetails.map((ingredient, idx: number) => {
            const IconComponent = ingredient.icon;

            return (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 h-8 bg-card border border-border rounded-md text-sm group"
              >
                <span className="flex items-center gap-1.5 flex-1 min-w-0">
                  <IconComponent className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground font-medium truncate">
                    {ingredient.name}
                  </span>
                </span>
                <span className="text-muted-foreground font-medium text-sm flex items-center gap-1">
                  <Weight className="w-3.5 h-3.5" />
                  {ingredient.weight}
                </span>

                {/* Action buttons */}
                {(onEditDishIngredient || onRemoveDishIngredient) && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEditDishIngredient && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          const product = products.find((p) => p.name === ingredient.name);
                          if (product) onEditDishIngredient(product.id);
                        }}
                        className="!border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/15 text-blue-600"
                        title="Открыть продукт"
                      >
                        <SquareArrowOutUpRight className="w-3 h-3" />
                      </Button>
                    )}
                    {onRemoveDishIngredient && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          const product = products.find((p) => p.name === ingredient.name);
                          if (product) onRemoveDishIngredient(product.id);
                        }}
                        className="!border-danger/20 bg-danger/10 hover:bg-danger/15 text-danger"
                        title="Удалить"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ItemContent;
