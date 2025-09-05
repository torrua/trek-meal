// src/components/database/mealtypes/MealTypeDetail.tsx

import React from 'react';
import { Utensils, Edit } from 'lucide-react';
import type { MealType } from '../../stores/useMealTypesStore';

interface MealTypeDetailProps {
  mealType: MealType | null;
  onEdit: () => void;
}

const MealTypeDetail: React.FC<MealTypeDetailProps> = ({ mealType, onEdit }) => {
  if (!mealType) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Utensils className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Выберите прием пищи
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Кликните на карточку для просмотра информации.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <Utensils className="w-8 h-8 text-blue-600" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {mealType.name}
          </h2>
        </div>
        <button
          onClick={onEdit}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          title="Редактировать"
        >
          <Edit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
      <div className="flex-1 p-4 sm:p-6">
        <p className="text-gray-500 dark:text-gray-400">
          Этот прием пищи будет доступен для выбора при планировании раскладки в походах.
        </p>
      </div>
    </div>
  );
};

export default MealTypeDetail;
