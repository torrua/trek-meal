// src/components/mealtypes/MealTypesPageContent.tsx

import React, { useState, useMemo, useCallback } from 'react';
import useMealTypesStore, { MealType } from '../../stores/useMealTypesStore';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import ConfirmModal from '../../ui/ConfirmModal';
import Modal from '../../ui/Modal';
import EntityCard, { MenuItem } from '../../ui/EntityCard';
import MealTypeDetail from './MealTypeDetail';
import { CirclePlus, Utensils, Edit, Trash2 } from 'lucide-react';

interface MealTypeFormProps {
  mealType: MealType | null;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

const MealTypeForm: React.FC<MealTypeFormProps> = ({ mealType, onSubmit, onCancel }) => {
  const [name, setName] = useState(mealType?.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name);
  };

  return (
    <form onSubmit={handleSubmit} className="p-1 space-y-6">
      <Input
        label="Название"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        required
      />
      <div className="flex justify-end gap-3 pt-6 border-t border-border">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">{mealType ? 'Сохранить' : 'Добавить'}</Button>
      </div>
    </form>
  );
};

const MealTypesPageContent: React.FC = () => {
  const { mealTypes, addMealType, updateMealType, deleteMealType } = useMealTypesStore();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingMealType, setEditingMealType] = useState<MealType | null>(null);
  const [typeToDelete, setTypeToDelete] = useState<MealType | null>(null);

  const selectedMealType = useMemo(
    () => mealTypes.find((mt) => mt.id === activeId) || null,
    [activeId, mealTypes]
  );

  const handleAddNew = useCallback(() => {
    setEditingMealType(null);
    setFormModalOpen(true);
  }, []);

  const handleEdit = useCallback((mealType: MealType) => {
    setEditingMealType(mealType);
    setFormModalOpen(true);
  }, []);

  const handleFormSubmit = (name: string) => {
    if (editingMealType) {
      updateMealType(editingMealType.id, name);
    } else {
      addMealType(name);
    }
    setFormModalOpen(false);
  };

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
    <>
      {/* Filters and actions */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button onClick={handleAddNew} variant="primary" size="default">
              <CirclePlus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Добавить прием пищи</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-1 space-y-3">
          {mealTypes.length === 0 ? (
            <div className="text-center py-16 px-6 text-muted-foreground">
              <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground">Приемов пищи пока нет</h3>
              <Button onClick={handleAddNew} className="mt-4">
                <CirclePlus className="w-4 h-4 mr-2" />
                Добавить первый
              </Button>
            </div>
          ) : (
            mealTypes.map((mt) => {
              const menuItems: MenuItem[] = [
                { label: 'Редактировать', icon: Edit, onClick: () => handleEdit(mt) },
                {
                  label: 'Удалить',
                  icon: Trash2,
                  onClick: () => handleDeleteRequest(mt),
                  className:
                    'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50',
                },
              ];

              return (
                <EntityCard
                  key={mt.id}
                  title={mt.name}
                  icon={Utensils}
                  iconColor="text-gray-500"
                  details={[]} // У приемов пищи нет дополнительных деталей
                  isSelected={activeId === mt.id}
                  onSelect={() => setActiveId(mt.id)}
                  menuItems={menuItems}
                />
              );
            })
          )}
        </div>

        <div className="lg:col-span-2 hidden lg:block sticky top-24 self-start max-h-[calc(100vh-7.5rem)]">
          {selectedMealType ? (
            <MealTypeDetail
              mealType={selectedMealType}
              onEdit={() => selectedMealType && handleEdit(selectedMealType)}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-4">
                <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Utensils className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Выберите прием пищи</h3>
                <p className="text-muted-foreground">
                  Кликните на карточку для просмотра информации.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingMealType ? 'Редактировать прием пищи' : 'Новый прием пищи'}
      >
        <MealTypeForm
          mealType={editingMealType}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!typeToDelete}
        onClose={() => setTypeToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Удалить прием пищи?"
        variant="danger"
      >
        <p>
          Вы уверены, что хотите удалить <span className="font-bold">{typeToDelete?.name}</span>?
        </p>
      </ConfirmModal>
    </>
  );
};

export default MealTypesPageContent;
