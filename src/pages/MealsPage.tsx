import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import {
  CirclePlus,
  Utensils,
  Trash2,
  Copy,
  Upload,
  X,
  CheckSquare,
  CheckCheck,
  LayoutList,
  Grid3X3,
  Filter,
  Download,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { useMealStore } from '../stores/useMealStore';
import useProductStore from '../stores/useProductStore';
import useDishStore from '../stores/useDishStore';
import useMealTypesStore from '../stores/useMealTypesStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useIsMobile } from '../hooks/useIsMobile';
import { useViewMode } from '../hooks/useViewMode';
import { useSelection } from '../hooks/useSelection';
import type { Meal, MealData } from '../types';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import MealDetail from '../components/meals/MealDetail';
import { generateUniqueMealName } from '../components/meals/mealFormUtils';
import { exportBulkMealsToJson, importDataFromJson } from '../utils/backup';
import MealListEntry from '../components/meals/MealListEntry';

const MealsPage: React.FC = () => {
  const { meals, addMeal, removeMeal } = useMealStore();
  const { products } = useProductStore();
  const { dishes } = useDishStore();
  const { mealTypes } = useMealTypesStore();

  const isMobile = useIsMobile();
  const { viewMode, toggleViewMode } = useViewMode('meals');
  const getVisibleFields = useSettingsStore((state) => state.getVisibleFields);
  const visibleFields = useMemo(() => getVisibleFields('meals'), [getVisibleFields]);

  const {
    selectedIds,
    isMultiSelectMode,
    toggleSelection,
    selectAll,
    clearSelection,
    enableMultiSelect,
  } = useSelection(meals, (m) => m.id);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATE ---
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<Meal | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(['basic-info', 'composition']);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // --- EFFECTS ---
  useEffect(() => {
    const targetId = searchParams.get('mealId') || searchParams.get('selectedId');
    if (targetId && meals.some((m) => m.id === Number(targetId))) {
      flushSync(() => {
        setActiveId(Number(targetId));
        setIsCreating(false);
        setIsEditing(false);
      });
      setSearchParams({}, { replace: true });
      setTimeout(() => {
        document.getElementById('meal-detail-pane')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  // --- HANDLERS ---
  const handleToggleSection = useCallback((sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  }, []);

  const selectedMeal = useMemo(
    () => meals.find((m) => m.id === activeId) || null,
    [activeId, meals]
  );

  const handleSelectMeal = useCallback(
    (id: number) => {
      if (activeId === id) {
        setActiveId(null);
        setIsEditing(false);
      } else {
        setActiveId(id);
        setIsCreating(false);
        setIsEditing(false);
      }
    },
    [activeId]
  );

  const handleEditMeal = useCallback((id: number) => {
    setActiveId(id);
    setIsCreating(false);
    setIsEditing(true);
  }, []);

  const handleCreateNew = useCallback(() => {
    if (isEditing) return;
    setIsCreating(true);
    setActiveId(null);
    setIsEditing(true);
    setOpenSections(['basic-info', 'composition']);
  }, [isEditing]);

  const handleSaveNew = useCallback(
    async (formData: MealData) => {
      const dataWithName = {
        ...formData,
        name: formData.name.trim() || generateUniqueMealName(meals),
      };
      const created = addMeal(dataWithName);
      setIsCreating(false);
      setActiveId(created.id);
      setIsEditing(false);
    },
    [addMeal, meals]
  );

  const handleRequestDelete = useCallback((meal: Meal) => setMealToDelete(meal), []);

  const handleConfirmDelete = useCallback(() => {
    if (!mealToDelete) return;
    if (mealToDelete.id === activeId) {
      setActiveId(null);
      setIsEditing(false);
    }
    removeMeal(mealToDelete.id);
    setMealToDelete(null);
  }, [mealToDelete, activeId, removeMeal]);

  const handleBulkDelete = () => {
    if (selectedIds.length > 0) setShowBulkDeleteConfirm(true);
  };
  const handleConfirmBulkDelete = () => {
    selectedIds.forEach((id) => {
      if (Number(id) === activeId) setActiveId(null);
      removeMeal(Number(id));
    });
    clearSelection();
    setShowBulkDeleteConfirm(false);
  };
  const handleBulkExport = () => {
    if (selectedIds.length === 0) return;
    exportBulkMealsToJson(meals.filter((meal) => selectedIds.includes(meal.id)));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) importDataFromJson(file);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
        accept=".json"
        className="hidden"
      />

      <div className="mb-6 sm:mb-8 flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
          Приёмы пищи
        </h1>
        {/* ИСПРАВЛЕНО: pr-1 совпадает с px-1 блока деталей, игнорируя скроллбар (он слева) */}
        <div className="flex items-center gap-2 min-w-[320px] justify-end pr-1">
          {!isMultiSelectMode ? (
            <>
              <Button variant="secondary" size="icon" title="Фильтры">
                <Filter className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                title="Импорт"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button onClick={toggleViewMode} variant="secondary" size="icon" title="Вид">
                {viewMode === 'default' ? (
                  <LayoutList className="w-4 h-4" />
                ) : (
                  <Grid3X3 className="w-4 h-4" />
                )}
              </Button>
              <Button onClick={enableMultiSelect} variant="secondary" size="icon" title="Выделить">
                <CheckSquare className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleCreateNew}
                disabled={isEditing || isCreating}
                variant="primary"
                size="icon"
                className={isCreating ? 'bg-primary/80' : ''}
              >
                <CirclePlus className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2 h-9 min-w-[320px] justify-end">
              <div className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium flex items-center">
                <span>{`${selectedIds.length} из ${meals.length} выделено`}</span>
              </div>
              <Button
                variant="secondary"
                size="icon"
                onClick={selectAll}
                disabled={selectedIds.length === meals.length}
              >
                <CheckCheck className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleBulkExport}
                  disabled={selectedIds.length === 0}
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <Button
                  variant="danger"
                  size="icon"
                  onClick={handleBulkDelete}
                  disabled={selectedIds.length === 0}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <Button onClick={clearSelection} variant="ghost" size="icon">
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {meals.length > 0 || isCreating ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[calc(100vh-12rem)] pl-1 pb-4 pt-2">
            {meals.map((meal) => (
              <MealListEntry
                key={meal.id}
                meal={meal}
                viewMode={viewMode}
                isActive={activeId === meal.id}
                isMultiSelected={selectedIds.includes(meal.id)}
                isSelectionDisabled={isEditing && activeId !== null && meal.id !== activeId}
                showMultiSelect={isMultiSelectMode}
                visibleFields={visibleFields}
                products={products}
                dishes={dishes}
                mealTypes={mealTypes}
                onSelect={() => handleSelectMeal(meal.id)}
                onToggleMultiSelect={() => {
                  enableMultiSelect();
                  toggleSelection(meal.id);
                }}
                onMultiSelect={() => toggleSelection(meal.id)}
                onEdit={() => handleEditMeal(meal.id)}
                onDelete={() => handleRequestDelete(meal)}
              />
            ))}
          </div>

          <div
            className="lg:col-span-2 hidden lg:block max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar pt-2 pb-20 px-1"
            id="meal-detail-pane"
            style={{ direction: 'ltr' }}
          >
            {isCreating ? (
              <MealDetail
                key="new"
                meal={null}
                isCreating={true}
                isEditing={true}
                onSaveNew={handleSaveNew}
                onCancelCreation={() => setIsCreating(false)}
                openSections={openSections}
                onToggleSection={handleToggleSection}
                setIsEditing={setIsEditing}
              />
            ) : selectedMeal ? (
              <MealDetail
                key={selectedMeal.id}
                meal={selectedMeal}
                isCreating={false}
                isEditing={isEditing}
                openSections={openSections}
                onToggleSection={handleToggleSection}
                setIsEditing={setIsEditing}
              />
            ) : (
              <div className="h-full flex items-start justify-center pt-16">
                <div className="text-center p-4">
                  <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Utensils className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Выберите приём пищи</h3>
                  <p className="text-muted-foreground">
                    Кликните на карточку для просмотра подробной информации.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center py-16">
          <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">Приёмов пищи пока нет</h3>
          <Button onClick={handleCreateNew} className="mt-4">
            <CirclePlus className="w-4 h-4 mr-2" />
            Создать первый приём пищи
          </Button>
        </div>
      )}

      <ConfirmModal
        isOpen={!!mealToDelete}
        onClose={() => setMealToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Подтверждение"
        variant="danger"
        confirmText="Удалить"
      >
        <p>
          Удалить приём пищи <span className="font-bold">{mealToDelete?.name}</span>?
        </p>
      </ConfirmModal>

      <ConfirmModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleConfirmBulkDelete}
        title="Подтверждение"
        variant="danger"
        confirmText="Удалить"
      >
        <p>Вы уверены, что хотите удалить {selectedIds.length} приёмов пищи?</p>
      </ConfirmModal>
    </div>
  );
};

export default MealsPage;
