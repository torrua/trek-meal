// src/components/categories/CategoriesPage.tsx

import React, { useState, useMemo } from 'react';
import useCategoryStore from '../../stores/useCategoryStore';
import useSearchStore from '../../stores/useSearchStore';
import type { Category, CategoryData } from '../../types';

import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import ConfirmModal from '../../ui/ConfirmModal';
import CategoryCard from './CategoryCard';

interface CategoryFormProps {
  category: Category | null;
  onSubmit: (data: CategoryData) => void;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSubmit, onCancel }) => {
  const [name, setName] = useState(category?.name || '');
  const [color, setColor] = useState(category?.color || '#a855f7');
  const [emoji, setEmoji] = useState(category?.emoji || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({ name, color, emoji });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-[auto_1fr] gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">Эмодзи</label>
          <input
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            className="w-20 h-10 text-2xl text-center px-3 py-2 border border-primary rounded-md"
            maxLength={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            Название категории
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full h-10 px-3 py-2 border border-primary rounded-md"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-secondary mb-1">Цвет</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full h-10 border border-primary rounded-md p-1"
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">{category ? 'Сохранить' : 'Добавить'}</Button>
      </div>
    </form>
  );
};

function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const { searchTerm } = useSearchStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return categories;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return categories.filter((cat) => cat.name.toLowerCase().includes(lowercasedFilter));
  }, [categories, searchTerm]);

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

  // --- ИЗМЕНЕНИЕ ---
  const handleRequestDelete = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation(); // Останавливаем всплытие, чтобы не открылась модалка редактирования
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
        <h2 className="text-2xl font-bold text-primary">Категории продуктов</h2>
        <Button onClick={() => handleOpenModal()}>+ Добавить категорию</Button>
      </header>

      {filteredCategories.length === 0 ? (
        <div className="text-center py-16 px-6 bg-muted rounded-lg">
          <h3 className="text-lg font-medium text-secondary">
            {searchTerm ? 'Категории не найдены' : 'Категорий пока нет'}
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((cat: Category) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onEdit={() => handleOpenModal(cat)}
              // --- ИЗМЕНЕНИЕ ---
              onDelete={(e) => handleRequestDelete(e, cat)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? 'Редактировать категорию' : 'Новая категория'}
      >
        <CategoryForm
          category={editingCategory}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Подтверждение удаления"
        variant="danger"
        confirmText="Удалить"
      >
        <p>
          Вы уверены, что хотите удалить категорию{' '}
          <span className="font-bold">{categoryToDelete?.name}</span>?
        </p>
        <p className="mt-2 text-sm text-muted">
          Продукты этой категории не будут удалены, но потеряют привязку к ней.
        </p>
      </ConfirmModal>
    </div>
  );
}

export default CategoriesPage;
