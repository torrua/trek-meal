// src/pages/MealTypesPage.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  CirclePlus,
  Utensils,
  Edit,
  Trash2,
  Repeat,
  Copy,
  Share,
  X,
  CheckCheck,
  LayoutList,
  Grid3X3,
} from 'lucide-react';
import useMealTypesStore from '../stores/useMealTypesStore';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import EntityCard, { MenuItem } from '../ui/EntityCard';
import { useViewMode } from '../hooks/useViewMode';

import type { MealType } from '../types';

const MealTypesPage: React.FC = () => {
  const { mealTypes, deleteMealType } = useMealTypesStore();
  const { viewMode, toggleViewMode } = useViewMode('meal-types');
  const [activeId, setActiveId] = useState<number | null>(null);
  const [typeToDelete, setTypeToDelete] = useState<{
    id: number;
    name: string;
    repeatable?: boolean;
  } | null>(null);
  // Multi-selection state
  const [selectedMealTypeIds, setSelectedMealTypeIds] = useState<number[]>([]);
  const [showMultiSelect, setShowMultiSelect] = useState(false);

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

  // Multi-selection handlers
  const toggleMultiSelect = () => {
    setShowMultiSelect(!showMultiSelect);
    if (showMultiSelect) {
      setSelectedMealTypeIds([]);
    }
  };

  const toggleMealTypeSelection = (mealTypeId: number) => {
    setSelectedMealTypeIds((prev: number[]) =>
      prev.includes(mealTypeId)
        ? prev.filter((id: number) => id !== mealTypeId)
        : [...prev, mealTypeId]
    );
  };

  const selectAllMealTypes = () => {
    setSelectedMealTypeIds(sortedMealTypes.map((mealType: MealType) => mealType.id));
  };

  // Exit multi-select mode completely
  const exitMultiSelectMode = () => {
    setShowMultiSelect(false);
    setSelectedMealTypeIds([]);
  };

  // Bulk action handlers
  const handleBulkDelete = () => {
    if (selectedMealTypeIds.length === 0) return;
    // For now, just log the action - would need to implement actual deletion
    console.log(`Deleting meal types: ${selectedMealTypeIds.join(', ')}`);
  };

  const handleBulkClone = () => {
    if (selectedMealTypeIds.length === 0) return;
    // For now, just log the action
    console.log(`Cloning meal types: ${selectedMealTypeIds.join(', ')}`);
  };

  const handleBulkExport = () => {
    if (selectedMealTypeIds.length === 0) return;
    // For now, just log the action
    console.log(`Exporting meal types: ${selectedMealTypeIds.join(', ')}`);
  };

  const handleClone = useCallback((mealType: MealType) => {
    const { cloneMealType } = useMealTypesStore.getState();
    cloneMealType(mealType.id);
  }, []);

  const handleExport = useCallback((mealType: MealType) => {
    try {
      const jsonString = JSON.stringify(mealType, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      const safeName = mealType.name.replace(/\s+/g, '-').toLowerCase();
      a.download = `meal-type-${safeName}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Данные типа приема пищи "${mealType.name}" экспортированы!`);
    } catch (error) {
      console.error('Ошибка при экспорте данных типа приема пищи:', error);
      toast.error('Произошла ошибка при экспорте.');
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header and buttons */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Типы приемов пищи
          </h1>
          <div className="flex items-center gap-2">
            {!showMultiSelect ? (
              <>
                {/* View mode toggle button */}
                <Button
                  onClick={toggleViewMode}
                  variant="secondary"
                  size="icon"
                  title={viewMode === 'default' ? 'Компактный вид' : 'Полный вид'}
                  aria-label={viewMode === 'default' ? 'Компактный вид' : 'Полный вид'}
                >
                  {viewMode === 'default' ? (
                    <LayoutList className="w-4 h-4" />
                  ) : (
                    <Grid3X3 className="w-4 h-4" />
                  )}
                </Button>

                <Button onClick={toggleMultiSelect} variant="secondary" size="default">
                  Выделить
                </Button>
                <Button
                  onClick={() => (window.location.href = '/meal-types/new')}
                  variant="primary"
                  size="default"
                >
                  <CirclePlus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Добавить тип</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 h-10">
                  <span>{selectedMealTypeIds.length}</span>
                  <span className="text-primary/70">из {sortedMealTypes.length} выделено</span>
                </div>

                <Button
                  variant="secondary"
                  size="icon"
                  onClick={selectAllMealTypes}
                  disabled={selectedMealTypeIds.length === sortedMealTypes.length}
                  title="Выделить все"
                >
                  <CheckCheck className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleBulkClone}
                    disabled={selectedMealTypeIds.length === 0}
                    title="Клонировать"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleBulkExport}
                    disabled={selectedMealTypeIds.length === 0}
                    title="Экспорт"
                  >
                    <Share className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="icon"
                    onClick={handleBulkDelete}
                    disabled={selectedMealTypeIds.length === 0}
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <Button onClick={exitMultiSelectMode} variant="ghost" size="icon" title="Закрыть">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
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
                  label: 'Клонировать',
                  icon: Copy,
                  onClick: () => handleClone(mealType),
                },
                {
                  label: 'Экспорт',
                  icon: Share,
                  onClick: () => handleExport(mealType),
                },
                {
                  label: 'Удалить',
                  icon: Trash2,
                  onClick: () => handleDeleteRequest(mealType),
                  className: 'text-danger hover:bg-danger/10',
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
                  isMultiSelected={selectedMealTypeIds.includes(mealType.id)}
                  onSelect={() => setActiveId(mealType.id)}
                  onMultiSelect={() => toggleMealTypeSelection(mealType.id)}
                  borderColor="#6b7280"
                  menuItems={menuItems}
                  data-testid={`meal-type-card-${mealType.id}`}
                  showMultiSelect={showMultiSelect}
                  viewMode={viewMode}
                />
              );
            })}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-2">
            {selectedMealType ? (
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Utensils className="w-8 h-8 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">
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
                    <h3 className="text-lg font-medium text-foreground mb-3">Информация о типе</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground">
                          Название
                        </label>
                        <p className="text-foreground">{selectedMealType.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground">
                          Повторяемость
                        </label>
                        <div className="flex items-center gap-2">
                          <Repeat className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">
                            {selectedMealType.repeatable
                              ? 'Можно добавлять несколько раз в день'
                              : 'Один раз в день'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-3">Использование</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground">
                          Используется в походах
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-foreground">
                            {/* Simplified for now - will fix the meal type usage logic later */}0
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-start justify-center pt-16">
                <div className="text-center p-4">
                  <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Utensils className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Выберите тип приема пищи
                  </h3>
                  <p className="text-muted-foreground">
                    Выберите тип из списка, чтобы увидеть подробную информацию
                  </p>
                </div>
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
