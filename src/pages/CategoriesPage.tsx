// src/pages/CategoriesPage.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CirclePlus, Filter, Package, Edit, Copy, Trash2, Share, Tag } from 'lucide-react';
import useCategoryStore from '../stores/useCategoryStore';
import useProductStore from '../stores/useProductStore';
import useSearchStore from '../stores/useSearchStore';
import { useCategoryManagement } from '../hooks/useCategoryManagement';
import type { Category } from '../types';
// Editing moved to dedicated page
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import EntityCard, { MenuItem } from '../ui/EntityCard';
import CategoryFiltersComponent, {
  CategoryFilters,
} from '../components/categories/CategoryFiltersComponent';
import CategoryDetail from '../components/categories/CategoryDetail';

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const categoryStore = useCategoryStore();
  const productStore = useProductStore();
  const { searchTerm } = useSearchStore();

  const [filters, setFilters] = useState<CategoryFilters>({
    hasProducts: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  const categoryManagement = useCategoryManagement({
    enableUrlSync: true,
    enableFilters: true,
    filters,
  });

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((v) => v !== 'all'),
    [filters]
  );

  const handleClone = useCallback(
    (category: Category) => {
      const { id: _id, ...categoryData } = category;
      categoryStore.addCategory(categoryData);
    },
    [categoryStore]
  );

  const handleExport = useCallback((category: Category) => {
    console.log('Export category', category);
  }, []);

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
            <Button onClick={() => navigate('/categories/new')} variant="primary" size="default">
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
          {categoryManagement.filteredCategories.map((category) => {
            const productCount = productStore.products.filter(
              (p) => p.categoryId === category.id
            ).length;

            const menuItems: MenuItem[] = [
              {
                label: 'Редактировать',
                icon: Edit,
                onClick: () => navigate(`/categories/${category.id}/edit`),
              },
              {
                label: 'Клонировать',
                icon: Copy,
                onClick: () => handleClone(category),
              },
              {
                label: 'Экспорт',
                icon: Share,
                onClick: () => handleExport(category),
              },
              {
                label: 'Удалить',
                icon: Trash2,
                onClick: () => categoryManagement.handleRequestDelete(category),
                className:
                  'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50',
              },
            ];

            return (
              <EntityCard
                key={category.id}
                title={category.name}
                subtitle={
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    <span>{productCount}</span>
                  </div>
                }
                icon={() => (
                  <span className="text-lg w-5 h-5 flex items-center justify-center">
                    {category.emoji || '📦'}
                  </span>
                )}
                details={[]} // Empty for true one-line layout
                isSelected={categoryManagement.activeId === category.id}
                onSelect={() => categoryManagement.setActiveId(category.id)}
                borderColor={category.color}
                menuItems={menuItems}
              />
            );
          })}
          {categoryManagement.filteredCategories.length === 0 && (
            <div className="text-center py-16 px-6 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground">
                {searchTerm || hasActiveFilters ? 'Категории не найдены' : 'Категорий пока нет'}
              </h3>
              {!searchTerm && !hasActiveFilters && (
                <Button onClick={categoryManagement.handleAddNew} className="mt-4">
                  <CirclePlus className="w-4 h-4 mr-2" />
                  Добавить первую категорию
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 hidden lg:block sticky top-24 self-start max-h-[calc(100vh-7.5rem)]">
          {categoryManagement.selectedCategory ? (
            <CategoryDetail
              category={categoryManagement.selectedCategory}
              onEdit={() =>
                categoryManagement.selectedCategory &&
                navigate(`/categories/${categoryManagement.selectedCategory.id}/edit`)
              }
              onEditProduct={categoryManagement.handleEditProduct}
              onDeleteProduct={categoryManagement.handleDeleteProductRequest}
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

      {/* Editing handled via CategoryDetailPage routes */}

      <ConfirmModal
        isOpen={!!categoryManagement.categoryToDelete}
        onClose={() => categoryManagement.setCategoryToDelete(null)}
        onConfirm={categoryManagement.handleConfirmDelete}
        title="Подтверждение"
        variant="danger"
        confirmText="Удалить"
      >
        <p>
          Вы уверены, что хотите удалить категорию{' '}
          <span className="font-bold">{categoryManagement.categoryToDelete?.name}</span>?
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Все продукты в этой категории будут перемещены в &quote;Без категории&quote;.
        </p>
      </ConfirmModal>
    </div>
  );
};

export default CategoriesPage;
