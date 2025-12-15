import React, { useState } from 'react';
import { ChevronDown, Weight, Flame } from 'lucide-react';
import cn from 'classnames';
import NutritionDisplay from './NutritionDisplay';

interface NutritionButtonProps {
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  weight?: number;
  className?: string;
  title?: string;
}

const NutritionButton: React.FC<NutritionButtonProps> = ({
  calories,
  proteins,
  fats,
  carbs,
  weight,
  className,
  title,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const buttonClasses = cn(
    // ДОБАВЛЕНО: shadow-sm
    'flex items-center gap-1.5 px-3 rounded-lg h-[32px] shadow-sm transition-all duration-200',
    {
      'bg-muted': isExpanded,
      'bg-muted/50 hover:bg-muted/80': !isExpanded,
    },
    className
  );

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <button
      onClick={handleClick}
      className={buttonClasses}
      title={title || `${calories} ккал`}
      type="button"
    >
      {isExpanded ? (
        <>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground -rotate-90" />
          <NutritionDisplay
            calories={calories}
            proteins={proteins}
            fats={fats}
            carbs={carbs}
            weight={weight}
          />
        </>
      ) : (
        <>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground rotate-90" />
          <div className="nutrition-item">
            <span
              className={`nutrition-value ${weight ? 'nutrition-value--weight' : 'nutrition-value--calories'}`}
            >
              {weight ? weight : calories}
            </span>
            {weight ? (
              <Weight className="nutrition-icon nutrition-icon--weight" />
            ) : (
              <Flame className="nutrition-icon nutrition-icon--calories" />
            )}
          </div>
        </>
      )}
    </button>
  );
};

export default NutritionButton;
