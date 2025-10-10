// src/pages/MealTypesPage.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { CirclePlus, Utensils, Edit, Trash2, Repeat } from 'lucide-react';
import useMealTypesStore from '../stores/useMealTypesStore';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import EntityCard, { MenuItem } from '../ui/EntityCard';

interface MealType {
  id: number;
  name: string;
  repeatable?: boolean;
}

const MealTypesPage: React.FC = () => {
  const { mealTypes, deleteMealType } = useMealTypesStore();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [typeToDelete, setTypeToDelete] = useState<{
    id: number;
    name: string;
    repeatable?: boolean;
  } | null>(null);

  const sortedMealTypes = useMemo(() => {
    return [...mealTypes].sort((a, b) => a.name.localeCompare(b.name));
  }, [mealTypes]);

  const selectedMealType = useMemo(
    () => mealTypes.find((mt) => mt.id === activeId) || null,
    [activeId, mealTypes]
  );

  const handleDeleteRequest = useCallback((mealType: MealType) => {
    setTypeToDelete(mealType);
  }, []);

  const handleDeleteConfirm = () => {
    if (typeToDelete) {
      if (typeToDelete.id === activeId) setActiveId(null);
      deleteMealType(typeToDelete.id);
      setTypeToDelete(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header and buttons */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Типы приемов пищи</h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => (window.location.href = '/meal-types/new')}
              variant="primary"
              size="default"
            >
              <CirclePlus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Добавить тип</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      {sortedMealTypes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-1 space-y-3">
            {sortedMealTypes.map((mealType) => {
              const menuItems: MenuItem[] = [
                {
                  label: 'Редактировать',
                  icon: Edit,
                  onClick: () => (window.location.href = `/meal-types/${mealType.id}`),
                },
                {
                  label: 'Удалить',
                  icon: Trash2,
                  onClick: () => handleDeleteRequest(mealType),
                  className:
                    'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50',
                },
              ];

              return (
                <EntityCard
                  key={mealType.id}
                  title={mealType.name}
                  icon={Utensils}
                  iconColor="text-primary"
                  details={[
                    {
                      key: 'repeatable',
                      icon: Repeat,
                      text: mealType.repeatable ? 'Повторяемый' : 'Один раз в день',
                    },
                  ]}
                  isSelected={activeId === mealType.id}
                  onSelect={() => setActiveId(mealType.id)}
                  borderColor="#6b7280"
                  menuItems={menuItems}
                  data-testid={`meal-type-card-${mealType.id}`}
                />
              );
            })}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-2">
            {selectedMealType ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Utensils className="w-8 h-8 text-primary" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedMealType.name}
                    </h2>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => (window.location.href = `/meal-types/${selectedMealType.id}`)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Редактировать
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Информация о типе
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                          Название
                        </label>
                        <p className="text-gray-900 dark:text-white">{selectedMealType.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                          Повторяемость
                        </label>
                        <div className="flex items-center gap-2">
                          <Repeat className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-900 dark:text-white">
                            {selectedMealType.repeatable
                              ? 'Можно добавлять несколько раз в день'
                              : 'Один раз в день'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Использование
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                          Используется в походах
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 dark:text-white">
                            {/* Simplified for now - will fix the meal type usage logic later */}0
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border p-8 text-center">
                <Utensils className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Выберите тип приема пищи
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Выберите тип из списка, чтобы увидеть подробную информацию
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 px-6 text-muted-foreground">
          <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">Типов пока нет</h3>
          <Button onClick={() => (window.location.href = '/meal-types/new')} className="mt-4">
            <CirclePlus className="w-4 h-4 mr-2" />
            Добавить первый тип
          </Button>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!typeToDelete}
        onClose={() => setTypeToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Удалить тип приема пищи"
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
      >
        Вы уверены, что хотите удалить тип &quot;{typeToDelete?.name}&quot;? Если этот тип
        используется в походах, удаление будет невозможно.
      </ConfirmModal>
    </div>
  );
};

export default MealTypesPage;
