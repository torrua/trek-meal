// src/pages/CategoriesPage.tsx

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CirclePlus,
  Filter,
  Tag,
  Component,
  Trash2,
  Copy,
  X,
  CheckSquare,
  CheckCheck,
  LayoutList,
  Grid3X3,
  Download,
  Upload,
} from 'lucide-react';
import useCategoryStore from '../stores/useCategoryStore';
import useProductStore from '../stores/useProductStore';
import useSearchStore from '../stores/useSearchStore';
import { useCategoryManagement } from '../hooks/useCategoryManagement';
import { useIsMobile } from '../hooks/useIsMobile';
import type { Category, ImportedJsonData } from '../types';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import Modal from '../ui/Modal';
import EntityCard from '../ui/EntityCard';
import EntityListItem, { MetaItem } from '../ui/EntityListItem';
import CategoryFiltersComponent, {
  CategoryFilters,
} from '../components/categories/CategoryFiltersComponent';
import CategoryDetail from '../components/categories/CategoryDetail';
import { categoryEntityConfig } from '../config/entityConfig';
import { useViewMode } from '../hooks/useViewMode';
import { exportCategoryToJson, exportBulkCategoriesToJson } from '../utils/backup';

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryStore = useCategoryStore();
  const productStore = useProductStore();
  const { searchTerm: _searchTerm } = useSearchStore();
  const isMobile = useIsMobile();

  const [filters, setFilters] = useState<CategoryFilters>({
    hasProducts: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [_importFileContent, setImportFileContent] = useState<ImportedJsonData | null>(null);

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

  // Collapsible sections state for CategoryDetail
  const [openSections, setOpenSections] = useState<string[]>(['basic-info', 'usage']);
  const [editTrigger, _setEditTrigger] = useState(0);
  const [editSubmitTrigger, _setEditSubmitTrigger] = useState(0);
  const [editCancelTrigger, _setEditCancelTrigger] = useState(0);

  const handleToggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  // URL synchronization - handle selectedId query parameter
  useEffect(() => {
    const selectedId = searchParams.get('selectedId');
    if (
      selectedId &&
      categoryManagement.filteredCategories.some((c) => c.id === Number(selectedId))
    ) {
      categoryManagement.setActiveId(Number(selectedId));
      setSearchParams({}, { replace: true });
      // Scroll to the detail pane
      setTimeout(() => {
        const detailPane = document.getElementById('category-detail-pane');
        if (detailPane) {
          detailPane.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [
    searchParams,
    categoryManagement.filteredCategories,
    categoryManagement.setActiveId,
    setSearchParams,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

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
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonContent = e.target?.result as string;
          const data = JSON.parse(jsonContent);
          setImportFileContent(data);
          setShowImportModal(true);
        } catch (error) {
          console.error('Error parsing JSON file:', error);
          // Show error toast
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const _handleInlineCreate = useCallback(
    (formData: Omit<Category, 'id'>) => {
      const created = categoryStore.addCategory(formData);
      categoryManagement.setActiveId(created.id);
      setCreatingCategory(false);
    },
    [categoryStore, categoryManagement]
  );

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
      <div className="mb-6 sm:mb-8 px-4 sm:px-2">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Категории продуктов
          </h1>
          <div className="flex items-center gap-2 min-w-[320px] justify-end">
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
                  title="Импорт"
                  aria-label="Импорт"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Download className="w-4 h-4" />
                </Button>

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
                  onClick={toggleMultiSelect}
                  variant="secondary"
                  size="icon"
                  title="Выделить"
                  aria-label="Выделить"
                >
                  <CheckSquare className="w-4 h-4" />
                </Button>

                <Button
                  onClick={() => {
                    setCreatingCategory(true);
                    categoryManagement.setActiveId(null);
                  }}
                  variant="primary"
                  size="default"
                >
                  <CirclePlus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Добавить категорию</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 h-9 min-w-[320px] justify-end">
                <div className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium flex items-center">
                  <span>{`${selectedCategoryIds.length} из ${categoryManagement.filteredCategories.length} выделено`}</span>
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
                    <Upload className="w-4 h-4" />
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
      {categoryManagement.filteredCategories.length > 0 || creatingCategory ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[calc(100vh-12rem)] pl-1 pb-4 pt-2">
            {categoryManagement.filteredCategories.map((category) => {
              const productCount = productStore.products.filter(
                (p) => p.categoryId === category.id
              ).length;

              const actions = categoryEntityConfig
                .getActions({
                  onEdit: () => navigate(`/categories/${category.id}/edit`),
                  onClone: () => handleClone(category),
                  onExport: () => handleExport(category),
                  onDelete: () => categoryManagement.handleRequestDelete(category),
                })
                .map((action) => ({
                  ...action,
                  onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (action.label === 'Редактировать') {
                      navigate(`/categories/${category.id}/edit`);
                    } else if (action.label === 'Клонировать') {
                      handleClone(category);
                    } else if (action.label === 'Экспорт') {
                      handleExport(category);
                    } else if (action.label === 'Удалить') {
                      categoryManagement.handleRequestDelete(category);
                    }
                  },
                }));

              const metaMap: Record<string, MetaItem | null> = {
                products:
                  productCount > 0
                    ? {
                        icon: Component,
                        text: productCount,
                        tooltip: 'Продукты',
                      }
                    : null,
              };

              const metaItems = Object.values(metaMap).filter(
                (item): item is MetaItem => item !== null
              );

              return viewMode === 'compact' ? (
                <EntityListItem
                  key={category.id}
                  title={categoryEntityConfig.views.card.title(category)}
                  meta={metaItems}
                  isSelected={categoryManagement.activeId === category.id}
                  isMultiSelected={selectedCategoryIds.includes(category.id)}
                  onSelect={() => categoryManagement.setActiveId(category.id)}
                  onMultiSelect={() => toggleCategorySelection(category.id)}
                  onRequestMultiSelectMode={() => {
                    if (!showMultiSelect) {
                      setShowMultiSelect(true);
                      setSelectedCategoryIds([category.id]);
                    }
                  }}
                  menuItems={actions}
                  showMultiSelect={showMultiSelect}
                  variant="category"
                />
              ) : (
                <EntityCard
                  key={category.id}
                  title={categoryEntityConfig.views.card.title(category)}
                  icon={categoryEntityConfig.getIcon(category)}
                  iconColor={categoryEntityConfig.getIconColor?.(category)}
                  isSelected={categoryManagement.activeId === category.id}
                  isMultiSelected={selectedCategoryIds.includes(category.id)}
                  onSelect={() => categoryManagement.setActiveId(category.id)}
                  onMultiSelect={() => toggleCategorySelection(category.id)}
                  onRequestMultiSelectMode={() => {
                    if (!showMultiSelect) {
                      setShowMultiSelect(true);
                      setSelectedCategoryIds([category.id]);
                    }
                  }}
                  menuItems={actions}
                  showMultiSelect={showMultiSelect}
                  variant="category"
                  details={[
                    {
                      key: 'products',
                      icon: Component,
                      text: productCount,
                      title: 'Продукты',
                    },
                  ]}
                />
              );
            })}
          </div>

          <div
            className="lg:col-span-2 hidden lg:block max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 custom-scrollbar pt-2"
            id="category-detail-pane"
          >
            {creatingCategory || categoryManagement.selectedCategory ? (
              <CategoryDetail
                category={categoryManagement.selectedCategory}
                openSections={openSections}
                onToggleSection={handleToggleSection}
                editTrigger={creatingCategory ? 1 : editTrigger}
                editSubmitTrigger={editSubmitTrigger}
                editCancelTrigger={editCancelTrigger}
                onStartEdit={undefined}
                onFinishEdit={() => {
                  if (creatingCategory) {
                    setCreatingCategory(false);
                  }
                }}
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
        <div className="h-full flex flex-col items-center justify-center py-16">
          <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">Категорий пока нет</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Создайте первую категорию для организации продуктов.
          </p>
          <div className="mt-4 inline-block">
            <Button
              onClick={() => {
                setCreatingCategory(true);
                categoryManagement.setActiveId(null);
              }}
              variant="primary"
              size="default"
            >
              <CirclePlus className="w-4 h-4 mr-2" />
              Добавить категорию
            </Button>
          </div>
        </div>
      )}

      {/* Mobile modal support */}
      {isMobile && categoryManagement.activeId !== null && (
        <div className="lg:hidden">
          <Modal
            isOpen={categoryManagement.activeId !== null}
            onClose={() => categoryManagement.setActiveId(null)}
            title={categoryManagement.selectedCategory?.name || 'Детали'}
          >
            <CategoryDetail
              category={categoryManagement.selectedCategory}
              onEdit={() => {
                if (categoryManagement.selectedCategory) {
                  navigate(`/categories/${categoryManagement.selectedCategory.id}/edit`);
                  categoryManagement.setActiveId(null);
                }
              }}
              onEditProduct={categoryManagement.handleEditProduct}
              onDeleteProduct={categoryManagement.handleDeleteProductRequest}
              openSections={openSections}
              onToggleSection={handleToggleSection}
              editTrigger={editTrigger}
              editSubmitTrigger={editSubmitTrigger}
              editCancelTrigger={editCancelTrigger}
              onStartEdit={undefined}
              onFinishEdit={undefined}
            />
          </Modal>
        </div>
      )}

      {/* Import modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportFileContent(null);
        }}
        title="Импорт категорий"
      >
        <div className="p-4">
          <p className="text-muted-foreground mb-4">Выберите файл JSON для импорта категорий.</p>
          {/* Add import form component here if needed */}
        </div>
      </Modal>

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
