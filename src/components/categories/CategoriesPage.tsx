// src/components/categories/CategoriesPage.tsx

import React, { useState } from 'react';
import useCategoryStore from '../../stores/useCategoryStore';
import type { Category, CategoryData } from '../../types';

import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import ConfirmModal from '../../ui/ConfirmModal';

// Props для формы
interface CategoryFormProps {
  category: Category | null;
  onSubmit: (data: CategoryData) => void;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSubmit, onCancel }) => {
  const [name, setName] = useState(category?.name || '');
  const [color, setColor] = useState(category?.color || '#a855f7');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({ name, color });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Название категории</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Цвет</label>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-10 border border-gray-300 rounded-md p-1" />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>Отмена</Button>
        <Button type="submit">{category ? 'Сохранить' : 'Добавить'}</Button>
      </div>
    </form>
  );
};

function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const handleOpenModal = (category: Category | null = null) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };
  
  const handleFormSubmit = (data: CategoryData) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, data);
    } else {
      addCategory(data);
    }
    handleCloseModal();
  };
  
  const handleRequestDelete = (category: Category) => {
    setCategoryToDelete(category);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold text-gray-800">Категории продуктов</h2>
        <Button onClick={() => handleOpenModal()}>+ Добавить категорию</Button>
      </header>
      
      <div className="space-y-2">
        {categories.map((cat: Category) => (
          <div key={cat.id} className="p-3 bg-white border rounded-lg flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full" style={{ backgroundColor: cat.color }}></span>
              <span className="font-medium">{cat.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => handleOpenModal(cat)} className="text-sm font-medium text-blue-600 hover:text-blue-800">Редактировать</button>
              <button onClick={() => handleRequestDelete(cat)} className="text-sm font-medium text-red-600 hover:text-red-800">Удалить</button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCategory ? 'Редактировать категорию' : 'Новая категория'}>
        <CategoryForm category={editingCategory} onSubmit={handleFormSubmit} onCancel={handleCloseModal} />
      </Modal>
      
      <ConfirmModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Подтверждение удаления"
        variant="danger"
        confirmText="Удалить"
      >
        <p>Вы уверены, что хотите удалить категорию <span className="font-bold">"{categoryToDelete?.name}"</span>?</p>
        <p className="mt-2 text-sm text-gray-500">Продукты этой категории не будут удалены, но потеряют привязку к ней.</p>
      </ConfirmModal>
    </div>
  );
}

export default CategoriesPage;