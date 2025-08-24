// src/components/dishes/DishesPage.tsx

import React, { useState } from 'react';
import useDishStore from '../../stores/useDishStore';
import useTripStore from '../../stores/useTripStore'; // Импортируем для проверки
import type { Dish, DishData, SubmitDishAction } from '../../types';
import DishCard from './DishCard';
import DishForm from './DishForm';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import ConfirmModal from '../../ui/ConfirmModal';
import { toast } from 'react-hot-toast';

function DishesPage() {
  const { dishes, addDish, updateDish, deleteDish } = useDishStore();
  const { isDishInUse } = useTripStore(); // Получаем функцию-проверщик

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [dishToDelete, setDishToDelete] = useState<Dish | null>(null);

  const handleAddNew = () => {
    setEditingDish(null);
    setIsModalOpen(true);
  };

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    setIsModalOpen(true);
  };

  // --- ИЗМЕНЕНИЕ: Умный обработчик запроса на удаление ---
  const handleRequestDelete = (dish: Dish) => {
    // 1. Проверяем сразу при клике
    if (isDishInUse(dish.id)) {
      // 2. Если используется - показываем информационное сообщение
      toast.error(
        'Это блюдо используется в одном или нескольких походах. Сначала удалите его из раскладок.',
        { duration: 5000 }
      );
    } else {
      // 3. Если не используется - открываем стандартное модальное окно подтверждения
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
    // Логика для 'add_as_new' и 'replace' обрабатывается в TripPlanningPage,
    // здесь нам просто нужно закрыть модалку
    setIsModalOpen(false);
    setEditingDish(null);
  };

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold text-gray-800">Мои блюда и шаблоны</h2>
        <Button onClick={handleAddNew}>+ Создать блюдо</Button>
      </header>

      {dishes.length === 0 ? (
        <div className="text-center py-16 px-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700">У вас пока нет сохраненных блюд</h3>
          <p className="text-gray-500 mt-2 mb-4">
            Создайте свое первое блюдо, чтобы ускорить планирование походов.
          </p>
          <Button onClick={handleAddNew}>Создать первое блюдо</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {dishes.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              onEdit={() => handleEdit(dish)}
              onDelete={() => handleRequestDelete(dish)}
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
