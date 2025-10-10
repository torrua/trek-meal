// src/pages/EquipmentCategoriesPage.tsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CirclePlus, Filter, Backpack, Edit, Copy, Trash2, Tag } from 'lucide-react';
import useEquipmentCategoryStore from '../stores/useEquipmentCategoryStore';
import useEquipmentStore from '../stores/useEquipmentStore';
import useSearchStore from '../stores/useSearchStore';
import type { EquipmentCategory } from '../types';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import EntityCard, { MenuItem } from '../ui/EntityCard';

const EquipmentCategoriesPage: React.FC = () => {
  const categoryStore = useEquipmentCategoryStore();
  const equipmentStore = useEquipmentStore();
  const { searchTerm } = useSearchStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<EquipmentCategory | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{ hasEquipment: string }>({
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
    // Navigate to new category page
    window.location.href = '/equipment-categories/new';
  }, []);

  const handleEdit = useCallback((c: EquipmentCategory) => {
    // Navigate to edit category page
    window.location.href = `/equipment-categories/${c.id}`;
  }, []);

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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header and buttons */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Категории снаряжения</h1>
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

      {/* Filters */}
      {showFilters && (
        <div className="mb-4 sm:mb-6 bg-card rounded-xl border p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Наличие снаряжения
              </label>
              <select
                value={filters.hasEquipment}
                onChange={(e) => setFilters((prev) => ({ ...prev, hasEquipment: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-1 space-y-3">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-16 px-6 text-muted-foreground">
              <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
          ) : (
            filteredCategories.map((category) => {
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
                      {category.iconName}
                    </span>
                  )}
                  details={details}
                  isSelected={activeId === category.id}
                  onSelect={() => setActiveId(category.id)}
                  borderColor={category.color}
                  menuItems={menuItems}
                  data-testid={`equipment-category-card-${category.id}`}
                />
              );
            })
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {selectedCategory ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedCategory.iconName}</span>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedCategory.name}
                  </h2>
                </div>
                <Button variant="secondary" size="sm" onClick={() => handleEdit(selectedCategory)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Редактировать
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Информация о категории
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Название
                      </label>
                      <p className="text-gray-900 dark:text-white">{selectedCategory.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Эмодзи
                      </label>
                      <span className="text-2xl">{selectedCategory.iconName}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Цвет
                      </label>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: selectedCategory.color }}
                        />
                        <span className="text-gray-900 dark:text-white font-mono">
                          {selectedCategory.color}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Статистика
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Количество снаряжения
                      </label>
                      <div className="flex items-center gap-2">
                        <Backpack className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-900 dark:text-white">
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
            <div className="bg-white dark:bg-gray-800 rounded-xl border p-8 text-center">
              <Tag className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Выберите категорию
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Выберите категорию из списка, чтобы увидеть подробную информацию
              </p>
            </div>
          )}
        </div>
      </div>

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
    </div>
  );
};

export default EquipmentCategoriesPage;
