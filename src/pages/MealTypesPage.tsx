// src/pages/MealTypesPage.tsx

import React, { useState, useMemo, useCallback } from 'react';
import useMealTypesStore, { MealType } from '../stores/useMealTypesStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ConfirmModal from '../ui/ConfirmModal';
import Modal from '../ui/Modal';
import EntityCard, { MenuItem } from '../ui/EntityCard';
import { CirclePlus, Utensils, Edit, Trash2, Repeat } from 'lucide-react';

interface MealTypeFormProps {
  mealType: MealType | null;
  onSubmit: (name: string, repeatable: boolean) => void;
  onCancel: () => void;
}

const MealTypeForm: React.FC<MealTypeFormProps> = ({ mealType, onSubmit, onCancel }) => {
  const [name, setName] = useState(mealType?.name || '');
  const [repeatable, setRepeatable] = useState(mealType?.repeatable || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, repeatable);
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
      <div className="flex items-center">
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              id="repeatable"
              checked={repeatable}
              onChange={(e) => setRepeatable(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`block w-10 h-6 rounded-full transition-colors ${
                repeatable ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            ></div>
            <div
              className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                repeatable ? 'transform translate-x-4' : ''
              }`}
            ></div>
          </div>
          <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            Можно добавлять несколько раз в день
          </span>
        </label>
      </div>
      <div className="flex justify-end gap-3 pt-6 border-t border-border">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">{mealType ? 'Сохранить' : 'Добавить'}</Button>
      </div>
    </form>
  );
};

// MealTypeDetail компонент перенесён сюда, чтобы не было ошибок импорта
const MealTypeDetail: React.FC<{ mealType: MealType; onEdit: () => void }> = ({
  mealType,
  onEdit,
}) => (
  <div className="p-6">
    <div className="flex items-center gap-3 mb-4">
      <Utensils className="w-8 h-8 text-primary" />
      <h2 className="text-2xl font-bold text-foreground">{mealType.name}</h2>
    </div>
    <div className="mb-4">
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
        <Repeat className="w-4 h-4" />
        {mealType.repeatable ? 'Можно добавлять несколько раз в день' : 'Один раз в день'}
      </span>
    </div>
    <Button variant="secondary" onClick={onEdit}>
      <Edit className="w-4 h-4 mr-2" />
      Редактировать
    </Button>
  </div>
);

const MealTypesPage: React.FC = () => {
  const { mealTypes, addMealType, updateMealType, deleteMealType } = useMealTypesStore();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingMealType, setEditingMealType] = useState<MealType | null>(null);
  const [typeToDelete, setTypeToDelete] = useState<MealType | null>(null);

  const sortedMealTypes = useMemo(() => {
    return [...mealTypes].sort((a, b) => a.name.localeCompare(b.name));
  }, [mealTypes]);

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

  const handleFormSubmit = (name: string, repeatable: boolean) => {
    if (editingMealType) {
      updateMealType(editingMealType.id, name, repeatable);
    } else {
      addMealType(name, repeatable);
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
      <div className="mb-4 sm:mb-6">
        <Button variant="primary" onClick={handleAddNew}>
          <CirclePlus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Добавить прием пищи</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-1 space-y-3">
          {sortedMealTypes.map((mealType) => {
            const menuItems: MenuItem[] = [
              {
                label: 'Редактировать',
                icon: Edit,
                onClick: () => handleEdit(mealType),
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
                details={[
                  {
                    key: 'repeatable',
                    icon: Repeat,
                    text: mealType.repeatable ? 'Повторяемый' : 'Один раз в день',
                  },
                ]}
                isSelected={activeId === mealType.id}
                onSelect={() => setActiveId(mealType.id)}
                menuItems={menuItems}
              />
            );
          })}
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
                  Кликните на карточку для просмотра подробной информации.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingMealType ? 'Редактировать прием пищи' : 'Добавить прием пищи'}
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
        title="Удалить прием пищи"
        variant="danger"
        confirmText="Удалить"
      >
        Вы уверены, что хотите удалить прием пищи &quot;{typeToDelete?.name}&quot;?
      </ConfirmModal>
    </>
  );
};

export default MealTypesPage;
