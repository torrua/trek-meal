// src/pages/CategoriesPage.tsx

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CirclePlus,
  Filter,
  Tag,
  Component,
  Trash2,
  Copy,
  Share,
  X,
  Check,
  CheckCheck,
  LayoutList,
  Grid3X3,
  UploadCloud,
} from 'lucide-react';
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
import { useViewMode } from '../hooks/useViewMode'; // Import the new hook
import {
  exportCategoryToJson,
  exportBulkCategoriesToJson,
  importDataFromJson,
} from '../utils/backup';

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Multi-selection state
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [showMultiSelect, setShowMultiSelect] = useState(false);
  // Add state for bulk delete confirmation
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((v) => v !== 'all'),
    [filters]
  );

  // Multi-selection handlers
  const toggleMultiSelect = () => {
    setShowMultiSelect(!showMultiSelect);
    if (showMultiSelect) {
      setSelectedCategoryIds([]);
    }
  };

  const toggleCategorySelection = (categoryId: number) => {
    setSelectedCategoryIds((prev: number[]) =>
      prev.includes(categoryId)
        ? prev.filter((id: number) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const selectAllCategories = () => {
    setSelectedCategoryIds(
      categoryManagement.filteredCategories.map((category: Category) => category.id)
    );
  };

  // Exit multi-select mode completely
  const exitMultiSelectMode = () => {
    setShowMultiSelect(false);
    setSelectedCategoryIds([]);
  };

  // Bulk action handlers
  const handleBulkDelete = () => {
    if (selectedCategoryIds.length === 0) return;
    // Show confirmation modal
    setShowBulkDeleteConfirm(true);
  };

  const handleConfirmBulkDelete = () => {
    // Delete all selected categories directly using the store function
    selectedCategoryIds.forEach((id) => {
      if (id === categoryManagement.activeId) categoryManagement.setActiveId(null);
      categoryStore.deleteCategory(id);
    });
    // Exit multi-select mode
    exitMultiSelectMode();
    setShowBulkDeleteConfirm(false);
  };

  const handleBulkClone = () => {
    if (selectedCategoryIds.length === 0) return;

    console.log(`Cloning categories: ${selectedCategoryIds.join(', ')}`);
  };

  const handleBulkExport = () => {
    if (selectedCategoryIds.length === 0) return;

    // Get selected categories and export them
    const selectedCategories = categoryManagement.filteredCategories.filter((c) =>
      selectedCategoryIds.includes(c.id)
    );
    exportBulkCategoriesToJson(selectedCategories);
  };

  // Import functionality
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importDataFromJson(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClone = useCallback(
    (category: Category) => {
      const { id: _id, ...categoryData } = category;
      categoryStore.addCategory(categoryData);
    },
    [categoryStore]
  );

  const handleExport = useCallback((category: Category) => {
    try {
      exportCategoryToJson(category);
      // toast.success('Категория экспортирована');
    } catch (error) {
      // toast.error('Ошибка при экспорте');
      console.error('Export error:', error);
    }
  }, []);

  // Function to transform category details to match EntityCard's DetailItem type
  const getCategoryDetails = (category: Category, productCount: number) => {
    return [
      {
        key: 'products',
        icon: Component,
        text: productCount,
        title: 'Продукты',
      },
    ];
  };

  // View mode state
  const { viewMode, toggleViewMode } = useViewMode('categories'); // Use the new hook

  return (
    <div className="max-w-7xl mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />
      {/* Заголовок и кнопки */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Категории
          </h1>
          <div className="flex items-center gap-2">
            {!showMultiSelect ? (
              <>
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

                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  title="Импорт"
                  aria-label="Импорт"
                >
                  <UploadCloud className="w-4 h-4" />
                </Button>

                <Button
                  onClick={toggleMultiSelect}
                  variant="secondary"
                  size="icon"
                  title="Выделить"
                  aria-label="Выделить"
                >
                  <Check className="w-4 h-4" />
                </Button>

                {/* View mode toggle button */}
                <Button
                  onClick={toggleViewMode}
                  variant="secondary"
                  size="icon"
                  title={viewMode === 'default' ? 'Компактный вид' : 'Полный вид'}
                  aria-label={viewMode === 'default' ? 'Компактный вид' : 'Полный вид'}
                >
                  {viewMode === 'default' ? (
                    <LayoutList className="w-4 h-4" />
                  ) : (
                    <Grid3X3 className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  onClick={() => navigate('/categories/new')}
                  variant="primary"
                  size="default"
                >
                  <CirclePlus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Добавить категорию</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 h-10">
                  <span>{selectedCategoryIds.length}</span>
                  <span className="text-primary/70">
                    из {categoryManagement.filteredCategories.length} выделено
                  </span>
                </div>

                <Button
                  variant="secondary"
                  size="icon"
                  onClick={selectAllCategories}
                  disabled={
                    selectedCategoryIds.length === categoryManagement.filteredCategories.length
                  }
                  title="Выделить все"
                >
                  <CheckCheck className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleBulkClone}
                    disabled={selectedCategoryIds.length === 0}
                    title="Клонировать"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleBulkExport}
                    disabled={selectedCategoryIds.length === 0}
                    title="Экспорт"
                  >
                    <Share className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="icon"
                    onClick={handleBulkDelete}
                    disabled={selectedCategoryIds.length === 0}
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <Button onClick={exitMultiSelectMode} variant="ghost" size="icon" title="Закрыть">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
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
          <div className="lg:col-span-1 space-y-3 overflow-y-auto max-h-[calc(100vh-12rem)] pr-2 custom-scrollbar pl-1 pb-4 pt-2">
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

              const _context = { productCount };

              return (
                <EntityCard
                  key={category.id}
                  title={categoryEntityConfig.views.card.title(category)}
                  icon={categoryEntityConfig.getIcon(category)}
                  iconColor={categoryEntityConfig.getIconColor?.(category)}
                  details={getCategoryDetails(category, productCount)}
                  isSelected={categoryManagement.activeId === category.id}
                  isMultiSelected={selectedCategoryIds.includes(category.id)}
                  onSelect={() => categoryManagement.setActiveId(category.id)}
                  onMultiSelect={() => toggleCategorySelection(category.id)}
                  menuItems={actions}
                  showMultiSelect={showMultiSelect}
                  viewMode={viewMode} // Pass viewMode to EntityCard
                />
              );
            })}
          </div>

          <div className="lg:col-span-2 hidden lg:block max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 custom-scrollbar">
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

      {/* Bulk delete confirmation */}
      <ConfirmModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleConfirmBulkDelete}
        title="Подтверждение"
        variant="danger"
        confirmText="Удалить"
      >
        <p>
          Вы уверены, что хотите удалить {selectedCategoryIds.length} категорий?
          <br />
          <span className="text-sm text-muted-foreground mt-2 block">
            Это действие нельзя отменить. Все данные о категориях будут потеряны.
          </span>
        </p>
      </ConfirmModal>
    </div>
  );
};

export default CategoriesPage;
