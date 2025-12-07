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
  showSeparators?: boolean;
  className?: string;
}

const NutritionDisplay: React.FC<NutritionDisplayProps> = ({
  calories,
  proteins,
  fats,
  carbs,
  weight,
  showSeparators = true,
  className,
}) => {
  const containerClasses = cn('nutrition-display', className);

  return (
    <div className={containerClasses}>
      {/* Калории */}
      <div className="nutrition-item">
        <Flame className="nutrition-icon nutrition-icon--calories" />
        <span className="nutrition-value nutrition-value--calories">{Math.round(calories)}</span>
      </div>

      {/* Разделитель после калорий */}
      {showSeparators && <div className="nutrition-separator" />}

      {/* Белки */}
      <div className="nutrition-item">
        <Beef className="nutrition-icon nutrition-icon--proteins" />
        <span className="nutrition-value nutrition-value--proteins">
          {Math.round(proteins * 10) / 10}
        </span>
      </div>

      {/* Жиры */}
      <div className="nutrition-item">
        <Droplet className="nutrition-icon nutrition-icon--fats" />
        <span className="nutrition-value nutrition-value--fats">{Math.round(fats * 10) / 10}</span>
      </div>

      {/* Углеводы */}
      <div className="nutrition-item">
        <Wheat className="nutrition-icon nutrition-icon--carbs" />
        <span className="nutrition-value nutrition-value--carbs">
          {Math.round(carbs * 10) / 10}
        </span>
      </div>

      {/* Разделитель после углеводов */}
      {showSeparators && <div className="nutrition-separator" />}

      {/* Вес */}
      {typeof weight === 'number' && (
        <div className="nutrition-item">
          <span className="nutrition-value nutrition-value--weight">{Math.round(weight)}</span>
          <Weight className="nutrition-icon nutrition-icon--weight" />
        </div>
      )}
    </div>
  );
};

export default NutritionDisplay;
