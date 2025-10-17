// src/pages/CategoriesPage.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CirclePlus, Filter, Tag } from 'lucide-react';
import useCategoryStore from '../stores/useCategoryStore';
import useProductStore from '../stores/useProductStore';
import useSearchStore from '../stores/useSearchStore';
import { useCategoryManagement } from '../hooks/useCategoryManagement';
import type { Category } from '../types';
// Editing moved to dedicated page
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import EntityCard from '../ui/EntityCard';
import CategoryFiltersComponent, {
  CategoryFilters,
} from '../components/categories/CategoryFiltersComponent';
import CategoryDetail from '../components/categories/CategoryDetail';
import { categoryEntityConfig } from '../config/entityConfig';

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

  // Function to transform category details to match EntityCard's DetailItem type
  const getCategoryDetails = (category: Category, productCount: number) => {
    return [
      {
        key: 'products',
        icon: categoryEntityConfig.getIcon(category),
        text: productCount,
        title: 'Продукты',
      },
    ];
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Заголовок и кнопки */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Категории
          </h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowFilters((s) => !s)}
              variant="secondary"
              size="icon"
              className="relative"
              title="Фильтры"
              aria-label="Показать фильтры"
            >
              <Filter className="w-4 h-4" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card" />
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
        <div className="mb-6 sm:mb-8 bg-card rounded-xl border border-border notion-shadow-xs p-4 sm:p-5">
          <CategoryFiltersComponent filters={filters} onFiltersChange={setFilters} />
        </div>
      )}

      {/* Основной контент */}
      {categoryManagement.filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-1 space-y-3">
            {categoryManagement.filteredCategories.map((category) => {
              const productCount = productStore.products.filter(
                (p) => p.categoryId === category.id
              ).length;

              const actions = categoryEntityConfig.getActions({
                onEdit: () => navigate(`/categories/${category.id}/edit`),
                onClone: () => handleClone(category),
                onExport: () => handleExport(category),
                onDelete: () => categoryManagement.handleRequestDelete(category),
              });

              const context = { productCount };

              return (
                <EntityCard
                  key={category.id}
                  title={categoryEntityConfig.views.card.title(category)}
                  subtitle={categoryEntityConfig.views.card.subtitle?.(category, context)}
                  icon={categoryEntityConfig.getIcon(category)}
                  iconColor={categoryEntityConfig.getIconColor?.(category)}
                  details={getCategoryDetails(category, productCount)}
                  isSelected={categoryManagement.activeId === category.id}
                  onSelect={() => categoryManagement.setActiveId(category.id)}
                  borderColor={categoryEntityConfig.getBorderColor(category)}
                  menuItems={actions}
                />
              );
            })}
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
              <div className="h-full flex items-start justify-center pt-16">
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
      ) : (
        <div className="text-center py-16 px-6 text-muted-foreground">
          <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
