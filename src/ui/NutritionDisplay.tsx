import React from 'react';
import { Flame, Beef, Droplet, Wheat, Weight } from 'lucide-react';
import cn from 'classnames';

/**
 * Компонент для отображения КБЖУВ в детальных представлениях (Details)
 * Используется в DishDetail, MealDetail, ProductDetail и т.д.
 */
export interface NutritionDisplayProps {
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  weight?: number;
  size?: 'sm' | 'md';
  showSeparators?: boolean;
  className?: string;
}

const NutritionDisplay: React.FC<NutritionDisplayProps> = ({
  calories,
  proteins,
  fats,
  carbs,
  weight,
  size = 'md',
  showSeparators = true,
  className,
}) => {
  const sizeClasses = {
    sm: {
      container: 'text-sm gap-2',
      icon: 'w-4 h-4',
      value: 'text-sm font-semibold',
      separator: 'w-px h-5',
    },
    md: {
      container: 'text-sm gap-2',
      icon: 'w-4 h-4',
      value: 'text-sm font-semibold',
      separator: 'w-px h-5',
    },
  };

  const currentSize = sizeClasses[size];

  const containerClasses = cn('flex items-center', currentSize.container, className);

  const iconClasses = cn('flex-shrink-0', currentSize.icon);

  const valueClasses = currentSize.value;
  const separatorClasses = cn('bg-border', currentSize.separator);

  return (
    <div className={containerClasses}>
      {/* Калории */}
      <div className="flex items-center gap-1">
        <Flame className={cn(iconClasses, 'text-orange-600')} />
        <span className={cn(valueClasses, 'text-orange-600')}>{Math.round(calories)}</span>
      </div>

      {/* Разделитель после калорий */}
      {showSeparators && <div className={separatorClasses} />}

      {/* Белки */}
      <div className="flex items-center gap-1">
        <Beef className={cn(iconClasses, 'text-blue-600')} />
        <span className={cn(valueClasses, 'text-blue-600')}>{Math.round(proteins * 10) / 10}</span>
      </div>

      {/* Жиры */}
      <div className="flex items-center gap-1">
        <Droplet className={cn(iconClasses, 'text-yellow-600')} />
        <span className={cn(valueClasses, 'text-yellow-600')}>{Math.round(fats * 10) / 10}</span>
      </div>

      {/* Углеводы */}
      <div className="flex items-center gap-1">
        <Wheat className={cn(iconClasses, 'text-green-600')} />
        <span className={cn(valueClasses, 'text-green-600')}>{Math.round(carbs * 10) / 10}</span>
      </div>

      {/* Разделитель после углеводов */}
      {showSeparators && <div className={separatorClasses} />}

      {/* Вес */}
      {typeof weight === 'number' && (
        <div className="flex items-center gap-1">
          <span className={cn(valueClasses, 'text-muted-foreground')}>{Math.round(weight)}</span>
          <Weight className={cn(iconClasses, 'text-muted-foreground')} />
        </div>
      )}
    </div>
  );
};

export default NutritionDisplay;
