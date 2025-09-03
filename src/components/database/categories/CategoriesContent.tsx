// src/components/database/categories/CategoriesContent.tsx

import React, { useState, useMemo } from 'react';
import useCategoryStore from '../../../stores/useCategoryStore';
import useSearchStore from '../../../stores/useSearchStore';
import type { Category, CategoryData } from '../../../types';
import Modal from '../../../ui/Modal';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import ConfirmModal from '../../../ui/ConfirmModal';
import CategoryCard from '../../categories/CategoryCard';
import { Plus } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="p-1 space-y-6">
      <Input
        label="Название категории *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoFocus
        placeholder="Например, Крупы и макароны"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Input
          label="Эмодзи"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="🌾"
          maxLength={2}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Цвет
          </label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-[50px] border border-gray-300 dark:border-gray-600 rounded-xl p-1 bg-white dark:bg-gray-700"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">{category ? 'Сохранить' : 'Добавить'}</Button>
      </div>
    </form>
  );
};

const CategoriesContent: React.FC = () => {
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

  const handleRequestDelete = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation();
    setCategoryToDelete(category);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить категорию
        </Button>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="text-center py-16 px-6 bg-muted rounded-lg">
          <h3 className="text-lg font-medium text-foreground">
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
        <p className="mt-2 text-sm text-muted-foreground">
          Продукты этой категории не будут удалены, но потеряют привязку к ней.
        </p>
      </ConfirmModal>
    </div>
  );
};

export default CategoriesContent;
