// src/components/equipment/EquipmentCategoriesPageContent.tsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CirclePlus, Filter, Backpack, Edit, Copy, Trash2, Share, Tag } from 'lucide-react';
import useEquipmentCategoryStore from '../../stores/useEquipmentCategoryStore';
import useEquipmentStore from '../../stores/useEquipmentStore';
import useSearchStore from '../../stores/useSearchStore';
import type { EquipmentCategory, EquipmentCategoryData } from '../../types';
import EquipmentCategoryForm from './EquipmentCategoryForm';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import ConfirmModal from '../../ui/ConfirmModal';
import EntityCard, { MenuItem } from '../../ui/EntityCard';
import EquipmentCategoryDetail from './EquipmentCategoryDetail';
import DropdownSelect from '../../ui/DropdownSelect';
import DynamicIcon from '../../ui/DynamicIcon';

export interface EquipmentCategoryFilters {
  hasEquipment: 'all' | 'with_equipment' | 'without_equipment';
}

const EquipmentCategoriesPageContent: React.FC = () => {
  const categoryStore = useEquipmentCategoryStore();
  const equipmentStore = useEquipmentStore();
  const { searchTerm } = useSearchStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EquipmentCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<EquipmentCategory | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<EquipmentCategoryFilters>({
    hasEquipment: 'all',
  });

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
      categoryStore.addCategory(categoryData);
    },
    [categoryStore]
  );

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

  return (
    <>
      {/* Filters and actions */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Button onClick={handleAddNew} variant="primary" size="default">
            <CirclePlus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Добавить категорию</span>
          </Button>
          <div className="relative">
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

            {/* Filter Popup */}
            {showFilters && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFilters(false)} />
                <div className="absolute top-full left-0 mt-2 z-50 bg-card border border-border rounded-lg shadow-lg p-4 min-w-[280px]">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-foreground">Фильтры</h3>
                      {hasActiveFilters && (
                        <button
                          onClick={() => setFilters({ hasEquipment: 'all' })}
                          className="text-xs text-muted-foreground hover:text-danger transition-colors"
                        >
                          Сбросить все
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <DropdownSelect
                        label="Наличие снаряжения"
                        icon={Backpack}
                        options={[
                          { value: 'all', label: 'Все категории' },
                          { value: 'with_equipment', label: 'Со снаряжением' },
                          { value: 'without_equipment', label: 'Без снаряжения' },
                        ]}
                        value={filters.hasEquipment}
                        onChange={(value) =>
                          setFilters((prev) => ({
                            ...prev,
                            hasEquipment: value as EquipmentCategoryFilters['hasEquipment'],
                          }))
                        }
                        isActive={filters.hasEquipment !== 'all'}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-1 space-y-3">
          {filteredCategories.map((category) => {
            const equipmentCount = equipmentStore.equipment.filter(
              (p) => p.categoryId === category.id
            ).length;

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
                subtitle={
                  <div className="flex items-center gap-1">
                    <Backpack className="w-4 h-4" />
                    <span>{equipmentCount}</span>
                  </div>
                }
                icon={() => <DynamicIcon name={category.iconName} />}
                details={[]} // Empty for true one-line layout
                isSelected={activeId === category.id}
                onSelect={() => setActiveId(category.id)}
                borderColor={category.color}
                menuItems={menuItems}
              />
            );
          })}
          {filteredCategories.length === 0 && (
            <div className="text-center py-16 px-6 text-muted-foreground">
              <Backpack className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
        </div>

        <div className="lg:col-span-2 hidden lg:block sticky top-24 self-start max-h-[calc(100vh-7.5rem)]">
          {selectedCategory ? (
            <EquipmentCategoryDetail
              category={selectedCategory}
              onEdit={() => selectedCategory && handleEdit(selectedCategory)}
              onEditEquipment={() => {
                /* no-op */
              }}
              onDeleteEquipment={() => {
                /* no-op */
              }}
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

      {/* Modals */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={editingCategory ? 'Редактирование категории' : 'Новая категория'}
      >
        <EquipmentCategoryForm
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
          Все снаряжение в этой категории будет перемещено в &quote;Без категории&quote;.
        </p>
      </ConfirmModal>
    </>
  );
};

export default EquipmentCategoriesPageContent;
