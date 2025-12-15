import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  Component,
  Soup,
  Weight,
  ChevronDown,
  Trash2,
  PieChart,
  Circle,
  SquareArrowOutUpRight,
} from 'lucide-react';
import type { Product, Dish, MealPlanItem, ProductPortion } from '../../types';
import Button from '../../ui/Button';
import NutritionButton from '../../ui/NutritionButton';
import { calculateItemNutrition, calculateItemWeight } from '../../utils/nutritionUtils';
import { DraggableAttributes } from '@dnd-kit/core';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

const itemExpansionCache = new Map<string, boolean>();

interface ItemContentProps {
  item: MealPlanItem;
  products: Product[];
  dishes: Dish[];
  onRemove?: () => void;
  onUpdateWeight?: (weight: number) => void;
  onEditItem?: () => void;
  onEditDishIngredient?: (productId: number) => void;
  onRemoveDishIngredient?: (productId: number) => void;
  readOnly?: boolean;
  showActions?: boolean;
  dragHandleProps?: {
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap | undefined;
  };
}

const MealItemContent: React.FC<ItemContentProps> = ({
  item,
  products,
  dishes,
  onRemove,
  onUpdateWeight: _onUpdateWeight,
  onEditItem,
  onEditDishIngredient: _onEditDishIngredient, // Unused
  onRemoveDishIngredient: _onRemoveDishIngredient, // Unused
  readOnly = false,
  showActions = true,
  dragHandleProps,
}) => {
  const uniqueKey =
    (item as MealPlanItem & { instanceId?: string }).instanceId || `${item.type}-${item.itemId}`;

  const [showProductPortion, setShowProductPortion] = useState(
    () => itemExpansionCache.get(uniqueKey) || false
  );
  useEffect(() => {
    itemExpansionCache.set(uniqueKey, showProductPortion);
  }, [showProductPortion, uniqueKey]);

  const [showPortionDropdown, setShowPortionDropdown] = useState(false);
  const [showDishIngredients, setShowDishIngredients] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const portionDropdownRef = useRef<HTMLDivElement>(null);
  const portionButtonRef = useRef<HTMLDivElement>(null);

  const selectedItem =
    item.type === 'product'
      ? products.find((p) => p.id === item.itemId)
      : dishes.find((d) => d.id === item.itemId);

  const nutrition = useMemo(
    () => calculateItemNutrition(item, products, dishes),
    [item, products, dishes]
  );
  const dishWeight = useMemo(
    () => calculateItemWeight(item, products, dishes),
    [item, products, dishes]
  );

  const isProduct = item.type === 'product';
  const isDish = item.type === 'dish';
  const displayWeight = isProduct ? Number(item.weight || 0) : Number(dishWeight);

  const dishDetails = useMemo(() => {
    if (item.type !== 'dish' || !selectedItem) return null;
    return (selectedItem as Dish).products
      .map((dp) => {
        const p = products.find((prod) => prod.id === dp.productId);
        if (!p) return null;
        const portion = p.portions?.find((port) => port.weight === dp.weight);
        return {
          name: p.name,
          weight: dp.weight,
          icon: portion?.isIndivisible ? Circle : PieChart,
          originalProductId: p.id,
        };
      })
      .filter(Boolean);
  }, [item.type, selectedItem, products]);

  const portions = useMemo(
    () => (item.type === 'product' ? (selectedItem as Product)?.portions || [] : []),
    [item, selectedItem]
  );
  const currentPortion = useMemo(
    () => portions.find((p) => Number(p.weight) === Number(item.weight)),
    [item.weight, portions]
  );
  const hasMultiplePortions = portions.length > 1;

  useEffect(() => {
    if (showPortionDropdown && portionButtonRef.current) {
      const update = () => {
        const rect = portionButtonRef.current?.getBoundingClientRect();
        if (rect) setDropdownPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
      };
      update();
      window.addEventListener('scroll', update, true);
      window.addEventListener('resize', update);
      return () => {
        window.removeEventListener('scroll', update, true);
        window.removeEventListener('resize', update);
      };
    }
  }, [showPortionDropdown]);

  useEffect(() => {
    const clickOut = (e: MouseEvent) => {
      if (
        portionDropdownRef.current &&
        !portionDropdownRef.current.contains(e.target as Node) &&
        !portionButtonRef.current?.contains(e.target as Node)
      ) {
        setShowPortionDropdown(false);
      }
    };
    if (showPortionDropdown) document.addEventListener('mousedown', clickOut);
    return () => document.removeEventListener('mousedown', clickOut);
  }, [showPortionDropdown]);

  const handleHeaderClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[role="button"]')) return;
    if (isDish && dishDetails?.length) setShowDishIngredients(!showDishIngredients);
    if (isProduct && portions?.length) setShowProductPortion(!showProductPortion);
  };

  const buttonBaseClass =
    'w-8 h-8 flex items-center justify-center rounded-lg bg-muted/50 hover:bg-muted/80 active:bg-background transition-all shadow-sm';

  return (
    <div className="space-y-1">
      {/* Header Row */}
      <div
        className={`flex items-center gap-2 ${(isDish && dishDetails?.length) || (isProduct && portions?.length) ? 'cursor-pointer' : ''}`}
        onClick={handleHeaderClick}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            {...(readOnly ? {} : dragHandleProps?.attributes)}
            {...(readOnly ? {} : dragHandleProps?.listeners)}
            className={`flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted/50 transition-colors ${!readOnly ? 'cursor-grab active:cursor-grabbing touch-none' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            {isProduct ? (
              <Component className="w-4 h-4 text-blue-600" />
            ) : (
              <Soup className="w-4 h-4 text-orange-600" />
            )}
          </div>

          <h4 className="font-medium truncate text-base select-none text-foreground">
            {selectedItem?.name}
          </h4>
        </div>

        {(nutrition || displayWeight > 0) && (
          <div onClick={(e) => e.stopPropagation()}>
            <NutritionButton
              calories={nutrition?.calories || 0}
              proteins={nutrition?.proteins || 0}
              fats={nutrition?.fats || 0}
              carbs={nutrition?.carbs || 0}
              weight={displayWeight}
            />
          </div>
        )}

        {!readOnly && showActions && (
          <div className="flex items-center gap-1">
            {onEditItem && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditItem();
                }}
                className={`${buttonBaseClass} text-blue-600`}
                title="Открыть"
              >
                <SquareArrowOutUpRight className="w-4 h-4" />
              </button>
            )}
            {onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className={`${buttonBaseClass} text-danger`}
                title="Удалить"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Portions Dropdown Selector (Продукт) */}
      {isProduct && portions && portions.length > 0 && item.weight && showProductPortion && (
        <div className="pt-2">
          <div className="relative w-full">
            <div
              ref={portionButtonRef}
              onClick={(e) => {
                if (hasMultiplePortions && !readOnly) {
                  e.stopPropagation();
                  setShowPortionDropdown(!showPortionDropdown);
                }
              }}
              className={`group relative flex items-center justify-between h-8 px-3 rounded-lg bg-card shadow-sm transition-colors duration-200 ${hasMultiplePortions && !readOnly ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-center gap-2">
                {currentPortion?.isIndivisible ? (
                  <Circle className="w-4 h-4 text-purple-500" />
                ) : (
                  <PieChart className="w-4 h-4 text-purple-500" />
                )}
                {/* ИЗМЕНЕНО: Возвращен text-muted-foreground с hover эффектом */}
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {currentPortion ? currentPortion.name : 'Другой'}
                </span>
              </div>

              {/* ЦЕНТРАЛЬНАЯ СТРЕЛКА */}
              {hasMultiplePortions && !readOnly && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                </div>
              )}

              {/* Правая часть: Вес + Иконка */}
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1 font-medium">
                {item.weight} <Weight className="w-4 h-4" />
              </span>
            </div>

            {/* Выпадающее меню */}
            {showPortionDropdown && !readOnly && (
              <div
                ref={portionDropdownRef}
                className="fixed z-[9999] bg-card border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto min-w-[200px] flex flex-col"
                style={{
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  width: dropdownPosition.width,
                }}
              >
                {portions.map((portion, idx) => {
                  const isActive = Number(portion.weight) === Number(item.weight);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (_onUpdateWeight) _onUpdateWeight(Number(portion.weight));
                        setShowPortionDropdown(false);
                      }}
                      className={`group w-full text-left flex items-center justify-between h-8 px-3 transition-colors ${
                        isActive
                          ? 'bg-primary/20 text-primary font-medium'
                          : 'text-foreground hover:bg-gray-200/80 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {portion.isIndivisible ? (
                          <Circle className="w-4 h-4 text-purple-500" />
                        ) : (
                          <PieChart className="w-4 h-4 text-purple-500" />
                        )}
                        <span className="text-sm font-medium">{portion.name}</span>
                      </div>
                      <span
                        className={`text-sm font-medium flex items-center gap-1 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}
                      >
                        {portion.weight} <Weight className="w-4 h-4" />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dish Ingredients (Блюдо) */}
      {isDish && dishDetails && showDishIngredients && (
        <div className="pt-2 space-y-1">
          {dishDetails.map((ing, idx) => {
            const Icon = ing.icon;
            return (
              <div
                key={idx}
                className="group flex items-center justify-between h-8 px-3 rounded-lg bg-card shadow-sm transition-colors duration-200 border border-transparent hover:border-border hover:bg-gray-50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="w-4 h-4 text-purple-500 shrink-0" />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1 font-medium truncate">
                    {ing.name}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors whitespace-nowrap ml-2 flex items-center gap-1 font-medium">
                  {ing.weight} <Weight className="w-4 h-4" />
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MealItemContent;
