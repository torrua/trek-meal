// src/components/meals/ImportMealsModal.tsx

import React, { useState, useMemo, useEffect } from 'react';
import type { MealData, Meal, ImportedJsonData } from '../../types';
import useMealStore from '../../stores/useMealStore';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import { CheckCircle, Utensils, Info } from 'lucide-react';

interface ImportMealsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileContent: ImportedJsonData | null;
}

type StagedMeal = MealData;

const ImportMealsModal: React.FC<ImportMealsModalProps> = ({ isOpen, onClose, fileContent }) => {
  const { meals: existingMeals, addMultipleMeals } = useMealStore();

  const [stagedMeals, setStagedMeals] = useState<StagedMeal[]>([]);
  const [totalMealsInFile, setTotalMealsInFile] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (fileContent && fileContent.meals && Array.isArray(fileContent.meals)) {
      setTotalMealsInFile(fileContent.meals.length);
      const existingMealNames = new Set(existingMeals.map((m) => m.name.toLowerCase()));
      const mealsToStage: StagedMeal[] = fileContent.meals
        .filter((m) => m.name && !existingMealNames.has(m.name.toLowerCase()))
        .map((m) => {
          // Remove id from imported meal if it exists since it will be generated
          if ('id' in m) {
            const { id: _id, ...mealData } = m as Meal;
            return mealData as MealData;
          }
          return m as MealData;
        });
      setStagedMeals(mealsToStage);
    } else {
      setStagedMeals([]);
      setTotalMealsInFile(0);
    }
  }, [fileContent, existingMeals]);

  const isReadyToImport = useMemo(() => {
    return stagedMeals.length > 0;
  }, [stagedMeals]);

  const handleImport = async () => {
    setIsProcessing(true);
    addMultipleMeals(stagedMeals);
    setIsProcessing(false);
    onClose();
  };

  const duplicatesCount = totalMealsInFile - stagedMeals.length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Импорт приёмов пищи" size="xl">
      <div className="space-y-6">
        <div className="p-4 bg-success/10 border border-success/20 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />
          <p className="text-success-foreground">
            Найдено <strong>{totalMealsInFile}</strong> приёмов пищи. Готово к импорту:{' '}
            <strong>{stagedMeals.length}</strong>.
          </p>
        </div>
        {duplicatesCount > 0 && (
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl flex items-center gap-3">
            <Info className="w-6 h-6 text-warning flex-shrink-0" />
            <p className="text-warning-foreground">
              <strong>{duplicatesCount}</strong> приёмов пищи уже существуют в вашей базе и будут
              пропущены.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary flex-shrink-0" />
            Приёмы пищи для импорта
          </h3>
          <p className="text-sm text-muted-foreground">
            Будут импортированы только новые приёмы пищи, которых еще нет в вашей базе.
          </p>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
          {stagedMeals.map((meal, index) => (
            <div key={index} className="p-3 rounded-xl bg-muted border border-border/50">
              <div className="font-medium truncate">{meal.name}</div>
              {meal.description && (
                <div className="text-sm text-muted-foreground truncate mt-1">
                  {meal.description}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                {meal.items.length} компонентов
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-border">
        <Button variant="secondary" onClick={onClose}>
          Отмена
        </Button>
        <Button onClick={handleImport} disabled={!isReadyToImport || isProcessing}>
          {isProcessing ? 'Обработка...' : `Импортировать ${stagedMeals.length} приёмов пищи`}
        </Button>
      </div>
    </Modal>
  );
};

export default ImportMealsModal;
