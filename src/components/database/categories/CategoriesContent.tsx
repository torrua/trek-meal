// src/components/database/categories/CategoriesContent.tsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import useCategoryStore from '../../../stores/useCategoryStore';
import useProductStore from '../../../stores/useProductStore';
import useSearchStore from '../../../stores/useSearchStore';
import type { Category, CategoryData, Product, ProductData } from '../../../types';
import Modal from '../../../ui/Modal';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import ConfirmModal from '../../../ui/ConfirmModal';
import CategoryCard from '../../categories/CategoryCard';
import CategoryDetail from '../../categories/CategoryDetail';
import ProductForm from '../../products/ProductForm';
import { CirclePlus, Tag, Palette } from 'lucide-react';

interface CategoryFormProps {
  category: CategoryData | null;
  onSubmit: (data: CategoryData) => void;
  onCancel: () => void;
}

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
];

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSubmit, onCancel }) => {
  const [name, setName] = useState(category?.name || '');
  const [color, setColor] = useState(category?.color || '#a855f7');
  const [emoji, setEmoji] = useState(category?.emoji || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({ name: name.trim(), color, emoji });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-1 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Предпросмотр
        </label>
        <div className="p-4 rounded-xl border-2" style={{ borderColor: color }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl"
              style={{ backgroundColor: color }}
            >
              {emoji || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {name || 'Название категории'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">0 продуктов</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 items-center">
        <Input
          label="Эмодзи"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="🌾"
          maxLength={2}
          containerClassName="w-24"
          className="text-center text-xl"
        />
        <Input
          label="Название категории *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
          placeholder="Например, Крупы и макароны"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Цвет
        </label>
        <div className="grid grid-cols-8 gap-2">
          {PRESET_COLORS.map((presetColor) => (
            <button
              key={presetColor}
              type="button"
              className="w-full h-8 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              style={{ backgroundColor: presetColor }}
              onClick={() => setColor(presetColor)}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3">
          <Palette className="w-5 h-5 text-gray-400" />
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-10 border-none p-0 bg-transparent rounded-lg"
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

interface CategoriesContentProps {
  setAddHandler: (handler: (() => void) | null) => void;
}

const CategoriesContent: React.FC<CategoriesContentProps> = ({ setAddHandler }) => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const { addProduct, updateProduct, deleteProduct } = useProductStore();
  const { searchTerm } = useSearchStore();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isProductFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (cat) =>
        !searchTerm.trim() || cat.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
  }, [categories, searchTerm]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === activeId) || null,
    [activeId, categories]
  );

  const handleAddNew = useCallback(() => {
    setEditingCategory(null);
    setFormModalOpen(true);
  }, []);

  useEffect(() => {
    setAddHandler(() => handleAddNew);
    return () => setAddHandler(null);
  }, [setAddHandler, handleAddNew]);

  const handleEdit = useCallback((category: Category) => {
    setEditingCategory(category);
    setFormModalOpen(true);
  }, []);

  const handleFormSubmit = (data: CategoryData) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, data);
    } else {
      addCategory(data);
    }
    setFormModalOpen(false);
  };

  const handleRequestDelete = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation();
    setCategoryToDelete(category);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      if (categoryToDelete.id === activeId) setActiveId(null);
      deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    }
  };

  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product);
    setProductFormOpen(true);
  }, []);

  const handleDeleteProductRequest = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setProductToDelete(product);
  };

  const handleProductFormSubmit = (formData: ProductData) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setProductFormOpen(false);
  };

  const handleProductDeleteConfirm = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 h-full">
      <div className="lg:col-span-1">
        <div className="h-[calc(100vh-360px)] min-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-16 px-6 text-gray-500">
              <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground">
                {searchTerm ? 'Категории не найдены' : 'Категорий пока нет'}
              </h3>
              {!searchTerm && (
                <Button onClick={handleAddNew} className="mt-4">
                  <CirclePlus className="w-4 h-4 mr-2" />
                  Добавить первую категорию
                </Button>
              )}
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                isSelected={activeId === cat.id}
                onSelect={() => setActiveId(cat.id)}
                onEdit={() => handleEdit(cat)}
                onDelete={(e) => handleRequestDelete(e, cat)}
              />
            ))
          )}
        </div>
      </div>

      <div className="lg:col-span-2 hidden lg:block">
        <CategoryDetail
          category={selectedCategory}
          onEdit={() => selectedCategory && handleEdit(selectedCategory)}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProductRequest}
        />
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingCategory ? 'Редактировать категорию' : 'Новая категория'}
      >
        <CategoryForm
          category={editingCategory}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormModalOpen(false)}
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
      </ConfirmModal>

      <Modal
        isOpen={isProductFormOpen}
        onClose={() => setProductFormOpen(false)}
        title={editingProduct ? 'Редактировать продукт' : 'Новый продукт'}
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleProductFormSubmit}
          onCancel={() => setProductFormOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleProductDeleteConfirm}
        title="Подтверждение удаления"
        variant="danger"
        confirmText="Удалить"
      >
        <p>
          Вы уверены, что хотите удалить продукт{' '}
          <span className="font-bold">{productToDelete?.name}</span>?
        </p>
      </ConfirmModal>
    </div>
  );
};

export default CategoriesContent;
