// src/pages/MealsPage.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Utensils, Trash2, Copy, Share, X, Check, CheckCheck } from 'lucide-react';
import { useMealStore } from '../stores/useMealStore';
import { useIsMobile } from '../hooks/useIsMobile';
import type { Meal, MealData } from '../types';
import Button from '../ui/Button';
import EntityCard from '../ui/EntityCard';
import { mealEntityConfig } from '../config/mealEntityConfig';
import Modal from '../ui/Modal';
import ConfirmModal from '../ui/ConfirmModal';
import MealForm from '../components/meals/MealForm';
import MealDetail from '../components/meals/MealDetail';

const MealsPage: React.FC = () => {
  const { meals, addMeal, updateMeal, removeMeal } = useMealStore();
  const isMobile = useIsMobile();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [mealToDelete, setMealToDelete] = useState<Meal | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(['main', 'items']);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Multi-selection state
  const [selectedMealIds, setSelectedMealIds] = useState<number[]>([]);
  const [showMultiSelect, setShowMultiSelect] = useState(false);

  const selectedMeal = useMemo(
    () => meals.find((m) => m.id === activeId) || null,
    [activeId, meals]
  );

  const handleAddNew = useCallback(() => {
    setEditingMeal(null);
    setShowFormModal(true);
  }, []);

  const handleEdit = useCallback((meal: Meal) => {
    setEditingMeal(meal);
    setShowFormModal(true);
  }, []);

  const handleFormSubmit = useCallback(
    (formData: MealData) => {
      if (editingMeal) {
        updateMeal(editingMeal.id, formData);
      } else {
        const created = addMeal(formData);
        setActiveId(created.id);
      }
      setShowFormModal(false);
      setEditingMeal(null);
    },
    [editingMeal, addMeal, updateMeal]
  );

  const handleRequestDelete = useCallback((meal: Meal) => setMealToDelete(meal), []);
  const handleConfirmDelete = useCallback(() => {
    if (mealToDelete) {
      if (mealToDelete.id === activeId) setActiveId(null);
      removeMeal(mealToDelete.id);
      setMealToDelete(null);
    }
  }, [mealToDelete, activeId, removeMeal]);

  // Multi-selection handlers
  const toggleMultiSelect = () => {
    setShowMultiSelect(!showMultiSelect);
    if (showMultiSelect) {
      setSelectedMealIds([]);
    }
  };

  const toggleMealSelection = (mealId: number) => {
    setSelectedMealIds((prev: number[]) =>
      prev.includes(mealId) ? prev.filter((id: number) => id !== mealId) : [...prev, mealId]
    );
  };

  const selectAllMeals = () => {
    setSelectedMealIds(meals.map((meal: Meal) => meal.id));
  };

  // Exit multi-select mode completely
  const exitMultiSelectMode = () => {
    setShowMultiSelect(false);
    setSelectedMealIds([]);
  };

  // Bulk action handlers
  const handleBulkDelete = () => {
    if (selectedMealIds.length === 0) return;
    // Show confirmation modal
    setShowBulkDeleteConfirm(true);
  };

  const handleConfirmBulkDelete = () => {
    // Delete all selected meals directly using the store function
    selectedMealIds.forEach((id) => {
      if (id === activeId) setActiveId(null);
      removeMeal(id);
    });
    // Exit multi-select mode
    exitMultiSelectMode();
    setShowBulkDeleteConfirm(false);
  };

  const handleBulkClone = () => {
    if (selectedMealIds.length === 0) return;

    console.log(`Cloning meals: ${selectedMealIds.join(', ')}`);
  };

  const handleBulkExport = () => {
    if (selectedMealIds.length === 0) return;

    console.log(`Exporting meals: ${selectedMealIds.join(', ')}`);
  };

  // Function to transform meal details to match EntityCard's DetailItem type
  const getMealDetails = (meal: Meal) => {
    return [
      {
        key: 'items',
        icon: mealEntityConfig.getIcon(meal),
        text: meal.items.length,
        title: 'Компоненты',
      },
    ];
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Приемы пищи
          </h1>
          <div className="flex items-center gap-2">
            {!showMultiSelect ? (
              <>
                <Link to="/meals/new">
                  <Button variant="primary" size="default">
                    <Plus className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Создать прием пищи</span>
                  </Button>
                </Link>
                <Button onClick={toggleMultiSelect} variant="secondary" size="default">
                  Выделить
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 h-10">
                  <span>{selectedMealIds.length}</span>
                  <span className="text-primary/70">из {meals.length} выделено</span>
                </div>

                <Button
                  variant="secondary"
                  size="icon"
                  onClick={selectAllMeals}
                  disabled={selectedMealIds.length === meals.length}
                  title="Выделить все"
                >
                  <CheckCheck className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleBulkClone}
                    disabled={selectedMealIds.length === 0}
                    title="Клонировать"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleBulkExport}
                    disabled={selectedMealIds.length === 0}
                    title="Экспорт"
                  >
                    <Share className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="icon"
                    onClick={handleBulkDelete}
                    disabled={selectedMealIds.length === 0}
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

      {meals.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* List */}
          <div className="lg:col-span-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[calc(100vh-12rem)]">
            {meals.map((meal) => {
              const actions = mealEntityConfig
                .getActions({
                  onEdit: () => handleEdit(meal),
                  onDelete: () => handleRequestDelete(meal),
                })
                .map((action) => ({
                  ...action,
                  onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // We need to call the original handler with the meal
                    // Since the original handler expects the meal as a parameter,
                    // we'll create a wrapper that calls it with the meal
                    if (action.label === 'Редактировать') {
                      handleEdit(meal);
                    } else if (action.label === 'Удалить') {
                      handleRequestDelete(meal);
                    }
                  },
                }));
              return (
                <EntityCard
                  key={meal.id}
                  title={mealEntityConfig.views.card.title(meal)}
                  subtitle={`${meal.items.length} комп.`}
                  icon={mealEntityConfig.getIcon(meal)}
                  iconColor="#6b7280" // gray-500 to match other pages
                  details={getMealDetails(meal)}
                  borderColor={mealEntityConfig.getBorderColor(meal)}
                  isSelected={activeId === meal.id}
                  isMultiSelected={selectedMealIds.includes(meal.id)}
                  onSelect={() => setActiveId(meal.id)}
                  onMultiSelect={() => toggleMealSelection(meal.id)}
                  menuItems={actions}
                  showMultiSelect={showMultiSelect}
                />
              );
            })}
          </div>

          {/* Detail (desktop) */}
          <div className="lg:col-span-2 hidden lg:block max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 custom-scrollbar">
            {selectedMeal ? (
              <MealDetail
                meal={selectedMeal}
                onEdit={() => selectedMeal && handleEdit(selectedMeal)}
                openSections={openSections}
                onToggleSection={(id) =>
                  setOpenSections((prev) =>
                    prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
                  )
                }
              />
            ) : (
              <div className="h-full flex items-start justify-center pt-16">
                <div className="text-center p-4">
                  <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Utensils className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Выберите прием пищи</h3>
                  <p className="text-muted-foreground">
                    Кликните на карточку для просмотра подробной информации.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 px-6 text-muted-foreground">
          <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">Приемов пищи пока нет</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Создайте первый шаблон, чтобы быстро добавлять его в раскладки.
          </p>
          <Link to="/meals/new" className="mt-4 inline-block">
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Создать прием пищи
            </Button>
          </Link>
        </div>
      )}

      {/* Detail modal (mobile) */}
      {isMobile && activeId !== null && (
        <div className="lg:hidden">
          <Modal
            isOpen={activeId !== null}
            onClose={() => setActiveId(null)}
            title={selectedMeal?.name || 'Детали'}
          >
            <MealDetail
              meal={selectedMeal}
              onEdit={() => {
                if (selectedMeal) {
                  handleEdit(selectedMeal);
                  setActiveId(null);
                }
              }}
              openSections={openSections}
              onToggleSection={(id) =>
                setOpenSections((prev) =>
                  prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
                )
              }
            />
          </Modal>
        </div>
      )}

      {/* Form modal */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={editingMeal ? 'Редактирование приема пищи' : 'Новый прием пищи'}
      >
        <MealForm
          meal={editingMeal}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowFormModal(false)}
        />
      </Modal>

      {/* Confirm delete */}
      <ConfirmModal
        isOpen={!!mealToDelete}
        onClose={() => setMealToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Подтверждение"
        variant="danger"
        confirmText="Удалить"
      >
        <p>
          Удалить прием пищи <span className="font-bold">{mealToDelete?.name}</span>?
        </p>
      </ConfirmModal>

      {/* Bulk delete confirmation */}
      <ConfirmModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleConfirmBulkDelete}
        title="Подтверждение"
        variant="danger"
        confirmText="Удалить"
      >
        <p>
          Вы уверены, что хотите удалить {selectedMealIds.length} приемов пищи?
          <br />
          <span className="text-sm text-muted-foreground mt-2 block">
            Это действие нельзя отменить. Все данные о приемах пищи будут потеряны.
          </span>
        </p>
      </ConfirmModal>
    </div>
  );
};

export default MealsPage;
