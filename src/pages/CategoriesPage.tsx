// src/pages/CategoriesPage.tsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CirclePlus, Filter, Package, Edit, Copy, Trash2, Share, Tag } from 'lucide-react';
import useCategoryStore from '../stores/useCategoryStore';
import useProductStore from '../stores/useProductStore';
import useSearchStore from '../stores/useSearchStore';
import type { Category, CategoryData } from '../types';
import CategoryForm from '../components/categories/CategoryForm';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import EntityCard, { MenuItem } from '../ui/EntityCard';
import CategoryFiltersComponent, {
  CategoryFilters,
} from '../components/categories/CategoryFiltersComponent';
import CategoryDetail from '../components/categories/CategoryDetail';

const CategoriesPage: React.FC = () => {
  const categoryStore = useCategoryStore();
  const productStore = useProductStore();
  const { searchTerm } = useSearchStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [filters, setFilters] = useState<CategoryFilters>({
    hasProducts: 'all',
  });
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const selectedId = searchParams.get('selectedId');
    if (selectedId && categoryStore.categories.some((c) => c.id === Number(selectedId))) {
      setActiveId(Number(selectedId));
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, categoryStore.categories, setSearchParams]);

  const filteredCategories = useMemo(() => {
    return categoryStore.categories
      .filter((c) => {
        if (searchTerm.trim()) {
          const search = searchTerm.toLowerCase();
          if (!c.name.toLowerCase().includes(search)) {
            return false;
          }
        }

        if (filters.hasProducts !== 'all') {
          const productCount = productStore.products.filter((p) => p.categoryId === c.id).length;
          if (filters.hasProducts === 'with_products' && productCount === 0) return false;
          if (filters.hasProducts === 'without_products' && productCount > 0) return false;
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categoryStore.categories, searchTerm, filters, productStore.products]);

  const selectedCategory = useMemo(
    () => categoryStore.categories.find((c) => c.id === activeId) || null,
    [activeId, categoryStore.categories]
  );

  const handleAddNew = useCallback(() => {
    setEditingCategory(null);
    setShowFormModal(true);
  }, []);

  const handleEdit = useCallback((c: Category) => {
    setEditingCategory(c);
    setShowFormModal(true);
  }, []);

  const handleFormSubmit = useCallback(
    (formData: CategoryData) => {
      if (editingCategory) {
        categoryStore.updateCategory(editingCategory.id, formData);
      } else {
        categoryStore.addCategory(formData);
      }
      setShowFormModal(false);
    },
    [editingCategory, categoryStore]
  );

  const handleClone = useCallback(
    (category: Category) => {
      const { id, ...categoryData } = category;
      categoryStore.addCategory(categoryData);
    },
    [categoryStore]
  );

  const handleRequestDelete = useCallback((c: Category) => setCategoryToDelete(c), []);
  const handleConfirmDelete = useCallback(() => {
    if (categoryToDelete) {
      if (categoryToDelete.id === activeId) setActiveId(null);
      categoryStore.deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    }
  }, [categoryToDelete, activeId, categoryStore]);

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((v) => v !== 'all'),
    [filters]
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Заголовок и кнопки */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Категории</h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowFilters((s) => !s)}
              variant="secondary"
              size="icon"
              className="relative"
              title="Фильтры"
            >
              <Filter className="w-4 h-4" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full border-2 border-card" />
              )}
            </Button>
            <Button onClick={handleAddNew} variant="primary" size="default">
              <CirclePlus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Добавить категорию</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      {showFilters && (
        <div className="mb-4 sm:mb-6 bg-card rounded-xl border p-3 sm:p-4">
          <CategoryFiltersComponent filters={filters} onFiltersChange={setFilters} />
        </div>
      )}

      {/* Основной контент */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-1 space-y-3">
          {filteredCategories.map((category) => {
            const productCount = productStore.products.filter(
              (p) => p.categoryId === category.id
            ).length;

            const details = [
              {
                icon: Package,
                text: productCount,
                title: 'Продуктов в категории',
              },
            ];

            const menuItems: MenuItem[] = [
              {
                label: 'Редактировать',
                icon: Edit,
                onClick: () => handleEdit(category),
              },
              {
                label: 'Клонировать',
                icon: Copy,
                onClick: () => handleClone(category),
              },
              {
                label: 'Экспорт',
                icon: Share,
                onClick: () => console.log('Export category', category),
              },
              {
                label: 'Удалить',
                icon: Trash2,
                onClick: () => handleRequestDelete(category),
                className:
                  'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50',
              },
            ];

            return (
              <EntityCard
                key={category.id}
                title={category.name}
                icon={() => (
                  <span className="text-xl w-6 h-6 flex items-center justify-center">
                    {category.emoji}
                  </span>
                )}
                details={details}
                isSelected={activeId === category.id}
                onSelect={() => setActiveId(category.id)}
                borderColor={category.color}
                menuItems={menuItems}
              />
            );
          })}
          {filteredCategories.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Категории не найдены</h3>
              <p>
                {searchTerm || hasActiveFilters
                  ? 'Попробуйте изменить критерии поиска.'
                  : 'Добавьте свою первую категорию.'}
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 hidden lg:block sticky top-24 self-start max-h-[calc(100vh-7.5rem)]">
          {selectedCategory ? (
            <CategoryDetail
              category={selectedCategory}
              onEdit={() => selectedCategory && handleEdit(selectedCategory)}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-4">
                <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Tag className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Выберите категорию</h3>
                <p className="text-muted-foreground">
                  Кликните на карточку для просмотра подробной информации.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Модальные окна */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={editingCategory ? 'Редактирование категории' : 'Новая категория'}
      >
        <CategoryForm
          category={editingCategory}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowFormModal(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Подтверждение"
        variant="danger"
        confirmText="Удалить"
      >
        <p>
          Вы уверены, что хотите удалить категорию{' '}
          <span className="font-bold">{categoryToDelete?.name}</span>?
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Все продукты в этой категории будут перемещены в &quote;Без категории&quote;.
        </p>
      </ConfirmModal>
    </div>
  );
};

export default CategoriesPage;
