// src/pages/EquipmentCategoriesPage.tsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CirclePlus,
  Filter,
  Backpack,
  Edit,
  Copy,
  Trash2,
  Layers,
  Share,
  X,
  Check,
  CheckCheck,
  LayoutList,
  Grid3X3,
} from 'lucide-react';
import { useViewMode } from '../hooks/useViewMode'; // Import the new hook
import useEquipmentCategoryStore from '../stores/useEquipmentCategoryStore';
import useEquipmentStore from '../stores/useEquipmentStore';
import useSearchStore from '../stores/useSearchStore';
import type { EquipmentCategory, EquipmentCategoryData } from '../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import EntityCard, { MenuItem } from '../ui/EntityCard';
import EquipmentCategoryForm from '../components/equipment/EquipmentCategoryForm';
import DynamicIcon from '../ui/DynamicIcon';
import { exportEquipmentCategoryToJson } from '../utils/backup';

const EquipmentCategoriesPage: React.FC = () => {
  const categoryStore = useEquipmentCategoryStore();
  const equipmentStore = useEquipmentStore();
  const { searchTerm } = useSearchStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EquipmentCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<EquipmentCategory | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{ hasEquipment: string }>({
    hasEquipment: 'all',
  });

  // Multi-selection state
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [showMultiSelect, setShowMultiSelect] = useState(false);

  // View mode state
  const { viewMode, toggleViewMode } = useViewMode('equipment-categories'); // Use the new hook

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

        if (filters.hasEquipment !== 'all') {
          const equipmentCount = equipmentStore.equipment.filter(
            (e) => e.categoryId === c.id
          ).length;
          if (filters.hasEquipment === 'with_equipment' && equipmentCount === 0) return false;
          if (filters.hasEquipment === 'without_equipment' && equipmentCount > 0) return false;
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categoryStore.categories, searchTerm, filters, equipmentStore.equipment]);

  const selectedCategory = useMemo(
    () => categoryStore.categories.find((c) => c.id === activeId) || null,
    [activeId, categoryStore.categories]
  );

  const handleAddNew = useCallback(() => {
    setEditingCategory(null);
    setShowFormModal(true);
  }, []);

  const handleEdit = useCallback((c: EquipmentCategory) => {
    setEditingCategory(c);
    setShowFormModal(true);
  }, []);

  const handleFormSubmit = useCallback(
    (formData: EquipmentCategoryData) => {
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
    (category: EquipmentCategory) => {
      const { id: _id, ...categoryData } = category;
      const clonedData = {
        ...categoryData,
        name: `${categoryData.name} (Копия)`,
      };
      categoryStore.addCategory(clonedData);
    },
    [categoryStore]
  );

  const handleExport = useCallback((category: EquipmentCategory) => {
    exportEquipmentCategoryToJson(category);
  }, []);

  const handleRequestDelete = useCallback((c: EquipmentCategory) => setCategoryToDelete(c), []);
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
    setSelectedCategoryIds(filteredCategories.map((category: EquipmentCategory) => category.id));
  };

  // Exit multi-select mode completely
  const exitMultiSelectMode = () => {
    setShowMultiSelect(false);
    setSelectedCategoryIds([]);
  };

  // Add state for bulk delete confirmation
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Bulk action handlers
  const handleBulkDelete = () => {
    if (selectedCategoryIds.length === 0) return;
    // Show confirmation modal
    setShowBulkDeleteConfirm(true);
  };

  const handleConfirmBulkDelete = () => {
    // Delete all selected equipment categories directly using the store function
    selectedCategoryIds.forEach((id) => {
      if (id === activeId) setActiveId(null);
      categoryStore.deleteCategory(id);
    });
    // Exit multi-select mode
    exitMultiSelectMode();
    setShowBulkDeleteConfirm(false);
  };

  const handleBulkClone = () => {
    if (selectedCategoryIds.length === 0) return;

    console.log(`Cloning equipment categories: ${selectedCategoryIds.join(', ')}`);
  };

  const handleBulkExport = () => {
    if (selectedCategoryIds.length === 0) return;

    console.log(`Exporting equipment categories: ${selectedCategoryIds.join(', ')}`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header and buttons */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Категории снаряжения
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

                <Button onClick={toggleMultiSelect} variant="secondary" size="default">
                  Выделить
                </Button>
                <Button onClick={handleAddNew} variant="primary" size="default">
                  <CirclePlus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Добавить категорию</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 h-10">
                  <span>{selectedCategoryIds.length}</span>
                  <span className="text-primary/70">из {filteredCategories.length} выделено</span>
                </div>

                <Button
                  variant="secondary"
                  size="icon"
                  onClick={selectAllCategories}
                  disabled={selectedCategoryIds.length === filteredCategories.length}
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

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 sm:mb-8 bg-card rounded-xl border border-border notion-shadow-xs p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">
                Наличие снаряжения
              </label>
              <select
                value={filters.hasEquipment}
                onChange={(e) => setFilters((prev) => ({ ...prev, hasEquipment: e.target.value }))}
                className="w-full p-2 border border-border rounded-lg bg-card text-foreground"
                aria-label="Фильтр по наличию снаряжения"
              >
                <option value="all">Все категории</option>
                <option value="with_equipment">С снаряжением</option>
                <option value="without_equipment">Без снаряжения</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-1 space-y-3 overflow-y-auto max-h-[calc(100vh-12rem)] pr-2 custom-scrollbar">
            {filteredCategories.map((category) => {
              const equipmentCount = equipmentStore.equipment.filter(
                (e) => e.categoryId === category.id
              ).length;

              const details = [
                {
                  key: 'equipment-count',
                  icon: Backpack,
                  text: equipmentCount,
                  title: 'Снаряжения в категории',
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
                  onClick: () => handleExport(category),
                },
                {
                  label: 'Удалить',
                  icon: Trash2,
                  onClick: () => handleRequestDelete(category),
                  className: 'text-danger hover:bg-danger/10',
                },
              ];

              // Create a component that renders the DynamicIcon
              const IconComponent = () => (
                <DynamicIcon name={category.iconName} className="w-5 h-5" />
              );

              return (
                <EntityCard
                  key={category.id}
                  title={category.name}
                  icon={IconComponent}
                  details={details}
                  isSelected={activeId === category.id}
                  isMultiSelected={selectedCategoryIds.includes(category.id)}
                  onSelect={() => setActiveId(category.id)}
                  onMultiSelect={() => toggleCategorySelection(category.id)}
                  borderColor={category.color}
                  menuItems={menuItems}
                  data-testid={`equipment-category-card-${category.id}`}
                  showMultiSelect={showMultiSelect}
                  viewMode={viewMode} // Pass viewMode to EntityCard
                />
              );
            })}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-2 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 custom-scrollbar">
            {selectedCategory ? (
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <DynamicIcon name={selectedCategory.iconName} className="w-8 h-8" />
                    <h2 className="text-xl font-semibold text-foreground">
                      {selectedCategory.name}
                    </h2>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(selectedCategory)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Редактировать
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-3">
                      Информация о категории
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground">
                          Название
                        </label>
                        <p className="text-foreground">{selectedCategory.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground">
                          Иконка
                        </label>
                        <DynamicIcon name={selectedCategory.iconName} className="w-8 h-8" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground">
                          Цвет
                        </label>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: selectedCategory.color }}
                          />
                          <span className="text-foreground font-mono">
                            {selectedCategory.color}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-3">Статистика</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground">
                          Количество снаряжения
                        </label>
                        <div className="flex items-center gap-2">
                          <Backpack className="w-4 h-4 text-muted-foreground" />
                          <p className="text-foreground">
                            {
                              equipmentStore.equipment.filter(
                                (e) => e.categoryId === selectedCategory.id
                              ).length
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-start justify-center pt-16">
                <div className="text-center p-4">
                  <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Layers className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Выберите категорию</h3>
                  <p className="text-muted-foreground">
                    Выберите категорию из списка, чтобы увидеть подробную информацию
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 px-6 text-muted-foreground">
          <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">
            {searchTerm || hasActiveFilters ? 'Категории не найдены' : 'Категорий пока нет'}
          </h3>
          {!searchTerm && !hasActiveFilters && (
            <Button onClick={handleAddNew} className="mt-4">
              <CirclePlus className="w-4 h-4 mr-2" />
              Добавить первую категорию
            </Button>
          )}
        </div>
      )}

      {/* Equipment Category Form Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={
          editingCategory ? 'Редактировать категорию снаряжения' : 'Добавить категорию снаряжения'
        }
      >
        <EquipmentCategoryForm
          category={editingCategory}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowFormModal(false)}
        />
      </Modal>

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Удалить категорию снаряжения"
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
      >
        Вы уверены, что хотите удалить категорию &quot;{categoryToDelete?.name}&quot;? Снаряжение в
        этой категории будет перемещено в &quot;Без категории&quot;.
      </ConfirmModal>

      {/* Bulk delete confirmation */}
      <ConfirmModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleConfirmBulkDelete}
        title="Удалить категории снаряжения"
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
      >
        <p>
          Вы уверены, что хотите удалить {selectedCategoryIds.length} категорий снаряжения?
          <br />
          <span className="text-sm text-muted-foreground mt-2 block">
            Снаряжение в этих категориях будет перемещено в &quot;Без категории&quot;.
          </span>
        </p>
      </ConfirmModal>
    </div>
  );
};

export default EquipmentCategoriesPage;
