// src/pages/DishesPage.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { CirclePlus, Soup, Edit, Trash2 } from 'lucide-react';
import useDishStore from '../stores/useDishStore';
import useTripStore from '../stores/useTripStore';
import useProductStore from '../stores/useProductStore';
import useSearchStore from '../stores/useSearchStore';
import type { Dish, DishData, SubmitDishAction } from '../types';
import EntityCard, { MenuItem } from '../ui/EntityCard';
import DishDetail from '../components/dishes/DishDetail';
import DishForm from '../components/dishes/DishForm';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import { toast } from 'react-hot-toast';

const DishesPage: React.FC = () => {
  const { dishes, addDish, updateDish, deleteDish } = useDishStore();
  const { isDishInUse } = useTripStore();
  const { products } = useProductStore();
  const { searchTerm } = useSearchStore();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [dishToDelete, setDishToDelete] = useState<Dish | null>(null);

  const filteredDishes = useMemo(() => {
    return dishes.filter(
      (dish) =>
        !searchTerm.trim() || dish.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
  }, [dishes, searchTerm]);

  const selectedDish = useMemo(
    () => dishes.find((d) => d.id === activeId) || null,
    [activeId, dishes]
  );

  const handleAddNew = useCallback(() => {
    setEditingDish(null);
    setFormModalOpen(true);
  }, []);

  const handleEdit = useCallback((dish: Dish) => {
    setEditingDish(dish);
    setFormModalOpen(true);
  }, []);

  const handleRequestDelete = useCallback(
    (dish: Dish) => {
      if (isDishInUse(dish.id)) {
        toast.error(
          'Это блюдо используется в одном или нескольких походах. Сначала удалите его из раскладок.',
          { duration: 5000 }
        );
      } else {
        setDishToDelete(dish);
      }
    },
    [isDishInUse]
  );

  const handleConfirmDelete = () => {
    if (dishToDelete) {
      if (dishToDelete.id === activeId) setActiveId(null);
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
    setFormModalOpen(false);
    setEditingDish(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Блюда</h1>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="primary" onClick={handleAddNew}>
              <CirclePlus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Добавить блюдо</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-1 space-y-3">
          {filteredDishes.length === 0 ? (
            <div className="text-center py-16 px-6 text-muted-foreground">
              <Soup className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground">
                {searchTerm ? 'Блюда не найдены' : 'Блюд пока нет'}
              </h3>
              {!searchTerm && (
                <Button onClick={handleAddNew} className="mt-4">
                  <CirclePlus className="w-4 h-4 mr-2" />
                  Создать первое блюдо
                </Button>
              )}
            </div>
          ) : (
            filteredDishes.map((dish) => {
              const totalWeight = dish.products.reduce((sum, p) => {
                const product = products.find((prod) => prod.id === p.productId);
                return sum + (product ? p.weight : 0);
              }, 0);

              const subtitle = `${dish.products.length} комп. / ${totalWeight} г`;

              const menuItems: MenuItem[] = [
                { label: 'Редактировать', icon: Edit, onClick: () => handleEdit(dish) },
                {
                  label: 'Удалить',
                  icon: Trash2,
                  onClick: () => handleRequestDelete(dish),
                  className:
                    'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50',
                },
              ];

              return (
                <EntityCard
                  key={dish.id}
                  title={dish.name}
                  subtitle={subtitle}
                  icon={Soup}
                  iconColor="text-gray-500"
                  details={[]} // Детали уже отображены в subtitle
                  isSelected={activeId === dish.id}
                  onSelect={() => setActiveId(dish.id)}
                  menuItems={menuItems}
                />
              );
            })
          )}
        </div>

        <div className="lg:col-span-2 hidden lg:block sticky top-24 self-start max-h-[calc(100vh-7.5rem)]">
          {selectedDish ? (
            <DishDetail
              dish={selectedDish}
              onEdit={() => selectedDish && handleEdit(selectedDish)}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-4">
                <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Soup className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Выберите блюдо</h3>
                <p className="text-muted-foreground">Кликните на карточку для просмотра состава.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingDish ? 'Редактировать блюдо' : 'Новое блюдо'}
      >
        <DishForm
          dish={editingDish}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormModalOpen(false)}
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
};

export default DishesPage;
