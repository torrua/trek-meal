// src/components/dishes/DishesPage.tsx

import React, { useState, useMemo } from 'react';
import useDishStore from '../../stores/useDishStore';
import useTripStore from '../../stores/useTripStore';
import useSearchStore from '../../stores/useSearchStore';
import type { Dish, DishData, SubmitDishAction } from '../../types';
import DishCard from './DishCard';
import DishForm from './DishForm';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import ConfirmModal from '../../ui/ConfirmModal';
import { toast } from 'react-hot-toast';

function DishesPage() {
  const { dishes, addDish, updateDish, deleteDish } = useDishStore();
  const { isDishInUse } = useTripStore();
  const { searchTerm } = useSearchStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [dishToDelete, setDishToDelete] = useState<Dish | null>(null);

  const filteredDishes = useMemo(() => {
    if (!searchTerm.trim()) {
      return dishes;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return dishes.filter((dish: Dish) => dish.name.toLowerCase().includes(lowercasedFilter));
  }, [dishes, searchTerm]);

  const handleAddNew = () => {
    setEditingDish(null);
    setIsModalOpen(true);
  };

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    setIsModalOpen(true);
  };

  // --- ИЗМЕНЕНИЕ ---
  const handleRequestDelete = (e: React.MouseEvent, dish: Dish) => {
    e.stopPropagation(); // Останавливаем всплытие
    if (isDishInUse(dish.id)) {
      toast.error(
        'Это блюдо используется в одном или нескольких походах. Сначала удалите его из раскладок.',
        { duration: 5000 }
      );
    } else {
      setDishToDelete(dish);
    }
  };

  const handleConfirmDelete = () => {
    if (dishToDelete) {
      deleteDish(dishToDelete.id);
      setDishToDelete(null);
    }
  };

  const handleFormSubmit = (formData: DishData, action: SubmitDishAction) => {
    if (action === 'create_or_update') {
      if (editingDish) {
        updateDish(editingDish.id, formData);
      } else {
        addDish(formData);
      }
    }
    setIsModalOpen(false);
    setEditingDish(null);
  };

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold text-primary">Мои блюда и шаблоны</h2>
        <Button onClick={handleAddNew}>+ Создать блюдо</Button>
      </header>

      {filteredDishes.length === 0 ? (
        <div className="text-center py-16 px-6 bg-muted rounded-lg">
          <h3 className="text-lg font-medium text-secondary">
            {searchTerm ? 'Блюда не найдены' : 'У вас пока нет сохраненных блюд'}
          </h3>
          <p className="text-muted-foreground mt-2 mb-4">
            {searchTerm
              ? 'Попробуйте изменить поисковый запрос.'
              : 'Создайте свое первое блюдо, чтобы ускорить планирование походов.'}
          </p>
          {!searchTerm && <Button onClick={handleAddNew}>Создать первое блюдо</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDishes.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              onEdit={() => handleEdit(dish)}
              // --- ИЗМЕНЕНИЕ ---
              onDelete={(e) => handleRequestDelete(e, dish)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDish ? 'Редактировать блюдо' : 'Новое блюдо'}
      >
        <DishForm
          dish={editingDish}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!dishToDelete}
        onClose={() => setDishToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Подтверждение удаления"
        variant="danger"
        confirmText="Удалить"
      >
        <p>
          Вы уверены, что хотите удалить блюдо{' '}
          <span className="font-bold">{dishToDelete?.name}</span>?
        </p>
      </ConfirmModal>
    </div>
  );
}

export default DishesPage;
