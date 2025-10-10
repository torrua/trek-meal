// src/components/database/dishes/DishesContent.tsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import useDishStore from '../../stores/useDishStore';
import useTripStore from '../../stores/useTripStore';
import useSearchStore from '../../stores/useSearchStore';
import type { Dish, DishData, SubmitDishAction } from '../../types';
import EntityCard from '../../ui/EntityCard';
import { dishEntityConfig } from '../../config/entityConfig';
import DishDetail from './DishDetail';
import DishForm from './DishForm';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import ConfirmModal from '../../ui/ConfirmModal';
import { toast } from 'react-hot-toast';
import { Soup, CirclePlus } from 'lucide-react';

interface DishesContentProps {
  setAddHandler: (handler: (() => void) | null) => void;
}

const DishesContent: React.FC<DishesContentProps> = ({ setAddHandler }) => {
  const { dishes, addDish, updateDish, deleteDish } = useDishStore();
  const { isDishInUse } = useTripStore();
  const { searchTerm } = useSearchStore();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [dishToDelete, setDishToDelete] = useState<Dish | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(['main', 'products', 'trips']);

  const handleToggleSection = useCallback((sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  }, []);

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

  useEffect(() => {
    setAddHandler(() => handleAddNew);
    return () => setAddHandler(null);
  }, [setAddHandler, handleAddNew]);

  const handleEdit = useCallback((dish: Dish) => {
    setEditingDish(dish);
    setFormModalOpen(true);
  }, []);

  const handleRequestDelete = (dish: Dish) => {
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 h-full">
      <div className="lg:col-span-1">
        <div className="h-[calc(100vh-360px)] min-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {filteredDishes.length === 0 ? (
            <div className="text-center py-16 px-6 text-gray-500">
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
              const cardConfig = dishEntityConfig.views.card;
              const menuItems = dishEntityConfig.getActions({
                onEdit: () => handleEdit(dish),
                onDelete: () => handleRequestDelete(dish),
              });

              // Временно добавляем 'key' для соответствия интерфейсу, так как он отсутствует в конфиге
              const detailsWithKeys = cardConfig.details(dish).map((detail) => ({
                ...detail,
                key: detail.title || 'detail',
              }));

              return (
                <EntityCard
                  key={dish.id}
                  title={cardConfig.title(dish)}
                  icon={dishEntityConfig.getIcon(dish)}
                  details={detailsWithKeys}
                  menuItems={menuItems}
                  isSelected={activeId === dish.id}
                  onSelect={() => setActiveId(dish.id)}
                />
              );
            })
          )}
        </div>
      </div>

      <div className="lg:col-span-2 hidden lg:block">
        <DishDetail
          dish={selectedDish}
          onEdit={() => selectedDish && handleEdit(selectedDish)}
          openSections={openSections}
          onToggleSection={handleToggleSection}
        />
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

export default DishesContent;
