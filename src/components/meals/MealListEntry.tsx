import React, { useMemo } from 'react';
import { Flame, Beef, Droplet, Wheat, Weight, Hash, Tag } from 'lucide-react';

import type { Meal, MealType, Product, Dish } from '../../types';
import { mealEntityConfig } from '../../config/mealEntityConfig';
import { calculateMealTotals } from '../../utils/nutritionUtils';
import EntityCard, { MenuItem } from '../../ui/EntityCard';
import EntityListItem, { MetaItem } from '../../ui/EntityListItem';

interface MealListEntryProps {
  meal: Meal;
  viewMode: 'default' | 'compact';
  isActive: boolean;
  isMultiSelected: boolean;
  isSelectionDisabled: boolean;
  showMultiSelect: boolean;
  visibleFields: string[]; // ID полей из настроек

  // Data dependencies
  products: Product[];
  dishes: Dish[];
  mealTypes: MealType[];

  // Actions
  onSelect: () => void;
  onToggleMultiSelect: () => void;
  onMultiSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const MealListEntry: React.FC<MealListEntryProps> = ({
  meal,
  viewMode,
  isActive,
  isMultiSelected,
  isSelectionDisabled,
  showMultiSelect,
  visibleFields,
  products,
  dishes,
  mealTypes,
  onSelect,
  onToggleMultiSelect,
  onMultiSelect,
  onEdit,
  onDelete,
}) => {
  // 1. Мемоизация тяжелых расчетов
  // Пересчитывается только если изменился состав items, список продуктов или блюд
  const totals = useMemo(() => {
    return calculateMealTotals(meal.items, products, dishes);
  }, [meal.items, products, dishes]);

  // 2. Подготовка мета-данных (для List View)
  const metaItems = useMemo(() => {
    const metaMap: Record<string, MetaItem | null> = {
      items:
        meal.items.length > 0
          ? { icon: Hash, text: meal.items.length, tooltip: 'Количество компонентов' }
          : null,
      mealType: meal.mealTypeId
        ? {
            icon: Tag,
            text: mealTypes.find((mt) => mt.id === meal.mealTypeId)?.name || 'Тип',
            tooltip: 'Тип приёма пищи',
          }
        : null,
      calories: {
        icon: Flame,
        text: totals.calories,
        className: 'text-orange-600',
        tooltip: 'Калории',
      },
      proteins: { icon: Beef, text: totals.proteins, className: 'text-blue-600', tooltip: 'Белки' },
      fats: { icon: Droplet, text: totals.fats, className: 'text-yellow-600', tooltip: 'Жиры' },
      carbs: { icon: Wheat, text: totals.carbs, className: 'text-green-600', tooltip: 'Углеводы' },
      weight: { icon: Weight, text: totals.weight, tooltip: 'Общий вес' },
    };

    return visibleFields.map((id) => metaMap[id]).filter((item): item is MetaItem => item !== null);
  }, [meal, totals, mealTypes, visibleFields]);

  // 3. Меню действий
  const actions: MenuItem[] = useMemo(() => {
    return mealEntityConfig
      .getActions({
        onEdit,
        onDelete,
      })
      .map((action) => ({
        ...action,
        disabled: isSelectionDisabled && !isActive,
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          if (isSelectionDisabled && !isActive) return;
          if (action.label === 'Редактировать') onEdit();
          else if (action.label === 'Удалить') onDelete();
        },
      }));
  }, [onEdit, onDelete, isSelectionDisabled, isActive]);

  // 4. Общие пропсы
  const commonProps = {
    title: mealEntityConfig.views.card.title(meal),
    isSelected: isActive,
    isMultiSelected: isMultiSelected,
    onSelect: isSelectionDisabled ? undefined : onSelect,
    onMultiSelect: isSelectionDisabled ? undefined : onMultiSelect,
    id: meal.id,
    onToggleMultiSelect: () => {
      if (!showMultiSelect && !isSelectionDisabled) {
        onToggleMultiSelect();
      }
    },
    menuItems: actions,
    showMultiSelect: showMultiSelect,
    variant: 'meal' as const,
  };

  if (viewMode === 'compact') {
    return <EntityListItem {...commonProps} meta={metaItems} />;
  }

  return (
    <EntityCard
      {...commonProps}
      subtitle={mealEntityConfig.views.card.subtitle?.(meal, {
        mealType: mealTypes.find((mt) => mt.id === meal.mealTypeId),
      })}
      icon={mealEntityConfig.getIcon(meal)}
      iconColor={mealEntityConfig.getIconColor?.()}
      nutrition={{
        calories: totals.calories,
        proteins: totals.proteins,
        fats: totals.fats,
        carbs: totals.carbs,
        weight: totals.weight,
        itemsCount: meal.items.length,
      }}
    />
  );
};

// Используем React.memo, чтобы компонент не перерисовывался,
// если не изменились пропсы (например, при выделении другого элемента списка)
export default React.memo(MealListEntry);
