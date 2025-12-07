import React, { useState } from 'react';
import { ChevronDown, Weight } from 'lucide-react';
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
    'flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-all',
    {
      'bg-muted': isExpanded,
      'bg-muted/50': !isExpanded,
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
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground -rotate-90 transition-transform" />
          <NutritionDisplay
            calories={calories}
            proteins={proteins}
            fats={fats}
            carbs={carbs}
            weight={weight}
            size="sm"
          />
        </>
      ) : (
        <>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground rotate-90 transition-transform" />
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-muted-foreground">{weight || 0}</span>
            <Weight className="w-4 h-4 text-muted-foreground" />
          </div>
        </>
      )}
    </button>
  );
};

export default NutritionButton;
