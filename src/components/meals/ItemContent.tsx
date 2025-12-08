// src/components/meals/ItemContent.tsx

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

// ВНЕШНИЙ КЭШ: Сохраняет состояние открытости блоков
const itemExpansionCache = new Map<string, boolean>();

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
  dragHandleProps,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const svgCompatibleListeners = dragHandleProps?.listeners
    ? {
        onPointerDown: (e: React.PointerEvent<SVGSVGElement>) => {
          setIsDragging(true);
          (
            dragHandleProps.listeners.onPointerDown as unknown as (
              e: React.PointerEvent<SVGSVGElement>
            ) => void
          )?.(e);
        },
        onTouchStart: (e: React.TouchEvent<SVGSVGElement>) => {
          setIsDragging(true);
          (
            dragHandleProps.listeners.onTouchStart as unknown as (
              e: React.TouchEvent<SVGSVGElement>
            ) => void
          )?.(e);
        },
        onTouchEnd: (e: React.TouchEvent<SVGSVGElement>) => {
          setIsDragging(false);
          (
            dragHandleProps.listeners.onTouchEnd as unknown as (
              e: React.TouchEvent<SVGSVGElement>
            ) => void
          )?.(e);
        },
      }
    : {};

  const svgCompatibleAttributes = dragHandleProps?.attributes
    ? Object.fromEntries(
        Object.entries(dragHandleProps.attributes).filter(
          ([key]) =>
            !key.startsWith('on') || ['onPointerDown', 'onTouchStart', 'onTouchEnd'].includes(key)
        )
      )
    : {};

  const uniqueKey =
    (item as MealPlanItem & { instanceId?: string }).instanceId || `${item.type}-${item.itemId}`;

  // --- СОСТОЯНИЯ ---
  const [showProductPortion, setShowProductPortion] = useState(() => {
    return itemExpansionCache.get(uniqueKey) || false;
  });

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

  // Обновление позиции dropdown
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

  // Закрытие dropdown при клике вне
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

    // Сброс состояния перетаскивания при mouse up
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (showPortionDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Всегда слушаем mouseUp для сброса состояния перетаскивания
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
    };
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
  }, [item, selectedItem]);

  const hasMultiplePortions = portions.length > 1;

  const currentPortion = useMemo(() => {
    if (item.type !== 'product' || !item.weight) return null;
    const weight = Number(item.weight);
    const foundPortion = portions.find((p: ProductPortion) => Number(p.weight) === weight);
    return foundPortion;
  }, [item, portions]);

  const handlePortionSelect = (portion: ProductPortion, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (_onUpdateWeight) _onUpdateWeight(Number(portion.weight));
    setShowPortionDropdown(false);
  };

  // Проверяем, можно ли вообще что-то развернуть в этом элементе
  const canExpand =
    (isDish && dishDetails && dishDetails.length > 0) ||
    (isProduct && portions && portions.length > 0);

  // Общий обработчик клика по строке заголовка
  const handleHeaderClick = (_e: React.MouseEvent) => {
    // Не обрабатываем клик во время перетаскивания
    if (isDragging) return;

    // Также не обрабатываем клик, если он был на drag handle
    const target = _e.target as HTMLElement;
    if (target.closest('[role="button"]')) {
      return;
    }

    // ВАЖНО: Мы не вызываем stopPropagation здесь, чтобы событие могло всплыть,
    // если это нужно для DND, но обычно DND работает через listeners на иконке.

    // Переключаем видимость
    if (isDish && dishDetails && dishDetails.length > 0) {
      setShowDishIngredients(!showDishIngredients);
    }
    if (isProduct && portions && portions.length > 0) {
      setShowProductPortion(!showProductPortion);
    }
  };

  return (
    <div className="space-y-1">
      {/* Header Row: теперь кликабельный целиком */}
      <div
        className={`flex items-center gap-2 ${canExpand ? 'cursor-pointer' : ''}`}
        onClick={handleHeaderClick}
      >
        {/* Иконка и Название (растягиваются, чтобы занять место) */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isProduct ? (
            <Component
              className="w-4 h-4 text-blue-500 flex-shrink-0 cursor-grab active:cursor-grabbing outline-none focus:outline-none"
              role="button"
              tabIndex={0}
              aria-label="Перетащить продукт"
              {...svgCompatibleListeners}
              {...svgCompatibleAttributes}
              // Убираем onClick с иконки, так как клик теперь на родителе
            />
          ) : (
            <Soup
              className="w-4 h-4 text-orange-500 flex-shrink-0 cursor-grab active:cursor-grabbing outline-none focus:outline-none"
              role="button"
              tabIndex={0}
              aria-label="Перетащить блюдо"
              {...svgCompatibleListeners}
              {...svgCompatibleAttributes}
            />
          )}
          <h4 className="font-medium text-foreground truncate">{selectedItem?.name}</h4>
        </div>

        {/* Nutrition block - отдельная кнопка, клик не должен всплывать */}
        {(nutrition || (isProduct && selectedItem && displayWeight && displayWeight > 0)) && (
          <div onClick={(e) => e.stopPropagation()}>
            <NutritionButton
              calories={
                nutrition
                  ? nutrition.calories
                  : isProduct && selectedItem
                    ? Math.round((selectedItem as Product).calories * (displayWeight / 100))
                    : 0
              }
              proteins={
                nutrition
                  ? nutrition.proteins
                  : isProduct && selectedItem
                    ? Math.round((selectedItem as Product).proteins * (displayWeight / 100) * 10) /
                      10
                    : 0
              }
              fats={
                nutrition
                  ? nutrition.fats
                  : isProduct && selectedItem
                    ? Math.round((selectedItem as Product).fats * (displayWeight / 100) * 10) / 10
                    : 0
              }
              carbs={
                nutrition
                  ? nutrition.carbs
                  : isProduct && selectedItem
                    ? Math.round((selectedItem as Product).carbs * (displayWeight / 100) * 10) / 10
                    : 0
              }
              weight={displayWeight}
            />
          </div>
        )}

        {/* Actions - кнопки редактирования/удаления */}
        {showActions && (
          <div className="flex items-center gap-2">
            {onEditItem && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation(); // Останавливаем всплытие
                  onEditItem();
                }}
                className="!border-blue-500/20 bg-blue-500/10 text-blue-600"
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
                  e.stopPropagation(); // Останавливаем всплытие
                  onRemove();
                }}
                className="!border-danger/20 bg-danger/10 text-danger"
                title="Удалить"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Portion selector block */}
      {isProduct && portions && portions.length > 0 && item.weight && showProductPortion && (
        <div className="pt-2">
          <div className="relative flex-1">
            <div
              ref={portionButtonRef}
              onClick={(e) => {
                if (hasMultiplePortions) {
                  e.stopPropagation();
                  setShowPortionDropdown(!showPortionDropdown);
                }
              }}
              className={`view-mode-field view-mode-single-line flex items-center ${
                hasMultiplePortions ? 'cursor-pointer' : 'cursor-default opacity-90'
              }`}
            >
              <span className="flex items-center gap-1.5 flex-1">
                {currentPortion ? (
                  currentPortion.isIndivisible ? (
                    <Circle className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <PieChart className="w-3.5 h-3.5 text-muted-foreground" />
                  )
                ) : (
                  <PieChart className="w-3.5 h-3.5 text-muted-foreground" />
                )}
                <span className="font-medium text-muted-foreground text-sm">
                  {currentPortion ? currentPortion.name : 'Другой'}
                </span>
              </span>

              {hasMultiplePortions && (
                <ChevronDown
                  className={`w-3 h-3 text-muted-foreground transition-transform mx-2 ${showPortionDropdown ? 'rotate-180' : ''}`}
                />
              )}

              <span className="text-muted-foreground font-medium text-sm flex items-center gap-1">
                {item.weight}
                <Weight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Dropdown Menu */}
            {showPortionDropdown && (
              <div
                ref={portionDropdownRef}
                className="fixed z-50 bg-card border border-border rounded-lg shadow-2xl py-0 max-h-60 overflow-auto"
                style={{
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${dropdownPosition.width}px`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                {portions.map((portion: ProductPortion, idx: number) => {
                  const OptionIcon = portion.isIndivisible ? Circle : PieChart;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handlePortionSelect(portion, e);
                      }}
                      className={`view-mode-field view-mode-single-line w-full text-left flex items-center justify-between ${Number(portion.weight) === Number(item.weight) ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      <span className="flex items-center gap-2">
                        <OptionIcon className="w-3.5 h-3.5 text-muted-foreground opacity-70" />
                        <span className="font-medium text-muted-foreground text-sm">
                          {portion.name}
                        </span>
                      </span>
                      <span className="text-muted-foreground font-medium text-sm flex items-center gap-1">
                        {portion.weight}
                        <Weight className="w-3.5 h-3.5" />
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
                className="view-mode-field view-mode-single-line flex items-center gap-2 group"
              >
                <span className="flex items-center gap-1.5 flex-1 min-w-0">
                  <IconComponent className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground font-medium truncate">
                    {ingredient.name}
                  </span>
                </span>
                <span className="text-muted-foreground font-medium text-sm flex items-center gap-1">
                  {ingredient.weight}
                  <Weight className="w-3.5 h-3.5" />
                </span>

                {/* Action buttons */}
                {(onEditDishIngredient || onRemoveDishIngredient) && (
                  <div className="flex items-center gap-1 opacity-100">
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
                        className="!border-blue-500/20 bg-blue-500/10 text-blue-600"
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
                        className="!border-danger/20 bg-danger/10 text-danger"
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
