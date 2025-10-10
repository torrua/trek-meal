// src/pages/MealsPage.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useMealStore } from '../stores/useMealStore';
import { Plus, Utensils } from 'lucide-react';
import Button from '../ui/Button';
import EntityCard from '../ui/EntityCard';
import { mealEntityConfig } from '../config/mealEntityConfig';
import Modal from '../ui/Modal';
import ConfirmModal from '../ui/ConfirmModal';
import MealForm from '../components/meals/MealForm';
import MealDetail from '../components/meals/MealDetail';
import type { Meal, MealData } from '../types';

const MealsPage: React.FC = () => {
  const { meals, addMeal, updateMeal, removeMeal } = useMealStore();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [mealToDelete, setMealToDelete] = useState<Meal | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(['main', 'items']);

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

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Приемы пищи</h1>
          <div className="flex items-center gap-2">
            <Link to="/meals/new">
              <Button variant="primary">
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Создать прием пищи</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {meals.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 h-full">
          {/* List */}
          <div className="lg:col-span-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[calc(100vh-12rem)]">
            {meals.map((meal) => {
              const cardConfig = mealEntityConfig.views.card;
              const actions = mealEntityConfig.getActions({
                onEdit: () => handleEdit(meal),
                onDelete: () => handleRequestDelete(meal),
              });
              return (
                <EntityCard
                  key={meal.id}
                  title={cardConfig.title(meal)}
                  icon={mealEntityConfig.getIcon(meal)}
                  details={cardConfig.details(meal)}
                  description={meal.description}
                  borderColor={mealEntityConfig.getBorderColor(meal)}
                  isSelected={activeId === meal.id}
                  onSelect={() => setActiveId(meal.id)}
                  menuItems={actions}
                />
              );
            })}
          </div>

          {/* Detail (desktop) */}
          <div className="lg:col-span-2 hidden lg:block sticky top-24 self-start max-h-[calc(100vh-7.5rem)]">
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
              <div className="h-full flex items-center justify-center">
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
      {activeId !== null && (
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
    </div>
  );
};

export default MealsPage;
