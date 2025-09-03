// src/components/database/mealtypes/MealTypesContent.tsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import useMealTypesStore, { MealType } from '../../../stores/useMealTypesStore';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import ConfirmModal from '../../../ui/ConfirmModal';
import Modal from '../../../ui/Modal';
import MealTypeCard from './MealTypeCard';
import MealTypeDetail from './MealTypeDetail';
import { CirclePlus, Utensils } from 'lucide-react';

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
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">{mealType ? 'Сохранить' : 'Добавить'}</Button>
      </div>
    </form>
  );
};

interface MealTypesContentProps {
  setAddHandler: (handler: (() => void) | null) => void;
}

const MealTypesContent: React.FC<MealTypesContentProps> = ({ setAddHandler }) => {
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

  useEffect(() => {
    setAddHandler(() => handleAddNew);
    return () => setAddHandler(null);
  }, [setAddHandler, handleAddNew]);

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

  const handleDeleteRequest = (e: React.MouseEvent, mealType: MealType) => {
    e.stopPropagation();
    setTypeToDelete(mealType);
  };

  const handleDeleteConfirm = () => {
    if (typeToDelete) {
      if (typeToDelete.id === activeId) setActiveId(null);
      deleteMealType(typeToDelete.id);
      setTypeToDelete(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 h-full">
      <div className="lg:col-span-1">
        <div className="h-[calc(100vh-360px)] min-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {mealTypes.length === 0 ? (
            <div className="text-center py-16 px-6 text-gray-500">
              <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground">Приемов пищи пока нет</h3>
              <Button onClick={handleAddNew} className="mt-4">
                <CirclePlus className="w-4 h-4 mr-2" />
                Добавить первый
              </Button>
            </div>
          ) : (
            mealTypes.map((mt) => (
              <MealTypeCard
                key={mt.id}
                mealType={mt}
                isSelected={activeId === mt.id}
                onSelect={() => setActiveId(mt.id)}
                onEdit={() => handleEdit(mt)}
                onDelete={(e) => handleDeleteRequest(e, mt)}
              />
            ))
          )}
        </div>
      </div>
      <div className="lg:col-span-2 hidden lg:block">
        <MealTypeDetail
          mealType={selectedMealType}
          onEdit={() => selectedMealType && handleEdit(selectedMealType)}
        />
      </div>

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
    </div>
  );
};

export default MealTypesContent;
