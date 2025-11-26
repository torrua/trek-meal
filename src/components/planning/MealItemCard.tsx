import React, { useState } from 'react';
import { GripVertical, Edit, Trash2, ChefHat, Component, ChevronDown } from 'lucide-react';
import Button from '../../ui/Button';
import { Dish, Product } from '../../types';

interface MealItemCardProps {
  type: 'product' | 'dish';
  itemData: Product | Dish | undefined; // Сам объект продукта или блюда
  weight?: number; // Вес (для продуктов)
  onRemove?: () => void;
  onEdit?: () => void; // Для клонирования блюда или изменения веса
  onUpdateWeight?: (weight: number) => void; // Только для продуктов
  onToggleExpand?: () => void; // Только для блюд
  isExpanded?: boolean; // Только для блюд
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>; // Props от dnd-kit
  children?: React.ReactNode; // Для вложенного списка состава блюда
}

const MealItemCard: React.FC<MealItemCardProps> = ({
  type,
  itemData,
  weight,
  onRemove,
  onEdit,
  onToggleExpand,
  isExpanded,
  dragHandleProps,
  children,
}) => {
  const [isExpandedInternal, setIsExpandedInternal] = useState(false);

  // Используем внутреннее состояние или переданное извне
  const expanded = isExpanded !== undefined ? isExpanded : isExpandedInternal;
  const handleToggle = onToggleExpand || (() => setIsExpandedInternal(!isExpandedInternal));

  if (!itemData)
    return (
      <div className="p-3 border border-danger/20 bg-danger/5 rounded-lg text-danger text-sm">
        Элемент не найден
      </div>
    );

  const isDish = type === 'dish';
  const bgColor = isDish
    ? 'bg-orange-500/5 hover:bg-orange-500/10'
    : 'bg-blue-500/5 hover:bg-blue-500/10';
  const borderColor = isDish ? 'border-orange-500/20' : 'border-blue-500/20';
  const Icon = isDish ? ChefHat : Component;
  const iconColor = isDish ? 'text-orange-500' : 'text-blue-500';

  // Вычисляем вес для отображения
  const displayWeight = isDish
    ? (itemData as Dish).products.reduce((sum, p) => sum + p.weight, 0)
    : weight;

  // Показываем состав блюда только если это блюдо и есть children
  const showIngredients = isDish && children;

  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg transition-all duration-200`}>
      <div className="flex items-center p-3 gap-3">
        {/* Drag Handle */}
        {dragHandleProps && (
          <button
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        )}

        {/* Icon */}
        <div
          className={`w-8 h-8 rounded-md bg-white/50 flex items-center justify-center flex-shrink-0 ${iconColor}`}
        >
          <Icon className="w-4 h-4" />
        </div>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <h4 className="font-medium text-sm text-foreground truncate">{itemData.name}</h4>
            <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
              {displayWeight} г
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onEdit}
              className="h-7 w-7 text-muted-foreground hover:text-primary"
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onRemove}
              className="h-7 w-7 text-muted-foreground hover:text-danger"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Состав блюда header */}
      {showIngredients && (
        <button
          onClick={handleToggle}
          className="w-full px-3 py-2 text-left text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          <span>Состав блюда ({(itemData as Dish).products.length})</span>
        </button>
      )}

      {/* Expanded Content (Ingredients for Dish) */}
      {showIngredients && expanded && children && (
        <div className="px-3 pb-3 pt-2 space-y-1">{children}</div>
      )}
    </div>
  );
};

export default MealItemCard;
