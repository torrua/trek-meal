// src/pages/EquipmentCategoriesPage.tsx

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CirclePlus,
  Filter,
  Layers,
  Trash2,
  Copy,
  Share,
  X,
  Check,
  CheckCheck,
  LayoutList,
  Grid3X3,
  UploadCloud,
  Info,
  Edit,
} from 'lucide-react';
import useEquipmentCategoryStore from '../stores/useEquipmentCategoryStore';
import useEquipmentStore from '../stores/useEquipmentStore';
import useSearchStore from '../stores/useSearchStore';
import type { EquipmentCategory } from '../types';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import EntityCard from '../ui/EntityCard';
import DetailPane from '../ui/DetailPane'; // Импортируем DetailPane
import { equipmentCategoryEntityConfig } from '../config/entityConfig';
import { useViewMode } from '../hooks/useViewMode';
import {
  exportEquipmentCategoryToJson,
  exportBulkEquipmentCategoriesToJson,
  importDataFromJson,
} from '../utils/backup';

const EquipmentCategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const equipmentCategoryStore = useEquipmentCategoryStore();
  const equipmentStore = useEquipmentStore();
  const { searchTerm } = useSearchStore();

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    hasEquipment: 'all' as 'all' | 'yes' | 'no',
  });

  // Multi-selection state
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [showMultiSelect, setShowMultiSelect] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Active category state
  const [activeId, setActiveId] = useState<number | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<EquipmentCategory | null>(null);

  // Detail Pane state
  const [openSections, setOpenSections] = useState<string[]>(['info']);

  const filteredCategories = useMemo(() => {
    return equipmentCategoryStore.categories
      .filter((category) => {
        const searchMatch =
          !searchTerm.trim() ||
          category.name.toLowerCase().includes(searchTerm.trim().toLowerCase());

        const equipmentMatch =
          filters.hasEquipment === 'all' ||
          (filters.hasEquipment === 'yes' &&
            equipmentStore.equipment.some((e) => e.categoryId === category.id)) ||
          (filters.hasEquipment === 'no' &&
            !equipmentStore.equipment.some((e) => e.categoryId === category.id));

        return searchMatch && equipmentMatch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [equipmentCategoryStore.categories, searchTerm, filters, equipmentStore.equipment]);

  const selectedCategory = useMemo(
    () => equipmentCategoryStore.categories.find((c) => c.id === activeId) || null,
    [activeId, equipmentCategoryStore.categories]
  );

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((v) => v !== 'all'),
    [filters]
  );

  // Handlers
  const handleToggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

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

  const exitMultiSelectMode = () => {
    setShowMultiSelect(false);
    setSelectedCategoryIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedCategoryIds.length === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  const handleConfirmBulkDelete = () => {
    selectedCategoryIds.forEach((id) => {
      if (id === activeId) setActiveId(null);
      equipmentCategoryStore.deleteCategory(id);
    });
    exitMultiSelectMode();
    setShowBulkDeleteConfirm(false);
  };

  const handleBulkClone = () => {
    if (selectedCategoryIds.length === 0) return;
    console.log(`Cloning equipment categories: ${selectedCategoryIds.join(', ')}`);
  };

  const handleBulkExport = () => {
    if (selectedCategoryIds.length === 0) return;
    const selectedCategories = filteredCategories.filter((c) => selectedCategoryIds.includes(c.id));
    exportBulkEquipmentCategoriesToJson(selectedCategories);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importDataFromJson(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClone = useCallback(
    (category: EquipmentCategory) => {
      const { id: _id, ...categoryData } = category;
      equipmentCategoryStore.addCategory(categoryData);
    },
    [equipmentCategoryStore]
  );

  const handleExport = useCallback((category: EquipmentCategory) => {
    try {
      exportEquipmentCategoryToJson(category);
    } catch (error) {
      console.error('Export error:', error);
    }
  }, []);

  const handleRequestDelete = useCallback(
    (category: EquipmentCategory) => {
      const hasEquipment = equipmentStore.equipment.some((e) => e.categoryId === category.id);
      if (hasEquipment) {
        alert('Невозможно удалить категорию, содержащую снаряжение. Сначала удалите снаряжение.');
        return;
      }
      setCategoryToDelete(category);
    },
    [equipmentStore.equipment]
  );

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      if (categoryToDelete.id === activeId) setActiveId(null);
      equipmentCategoryStore.deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    }
  };

  const { viewMode, toggleViewMode } = useViewMode('equipment-categories');

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
                >
                  <UploadCloud className="w-4 h-4" />
                </Button>

                <Button
                  onClick={toggleViewMode}
                  variant="secondary"
                  size="icon"
                  title={viewMode === 'default' ? 'Компактный вид' : 'Полный вид'}
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
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => navigate('/equipment-categories/new')}
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Содержит снаряжение
              </label>
              <div className="flex gap-2">
                <Button
                  variant={filters.hasEquipment === 'all' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFilters({ ...filters, hasEquipment: 'all' })}
                >
                  Все
                </Button>
                <Button
                  variant={filters.hasEquipment === 'yes' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFilters({ ...filters, hasEquipment: 'yes' })}
                >
                  С снаряжением
                </Button>
                <Button
                  variant={filters.hasEquipment === 'no' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFilters({ ...filters, hasEquipment: 'no' })}
                >
                  Без снаряжения
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-1 space-y-3 overflow-y-auto max-h-[calc(100vh-12rem)] pr-2 custom-scrollbar pl-1 pb-4">
            {filteredCategories.map((category) => {
              const equipmentCount = equipmentStore.equipment.filter(
                (e) => e.categoryId === category.id
              ).length;

              const actions = equipmentCategoryEntityConfig.getActions({
                onEdit: () => navigate(`/equipment-categories/${category.id}`),
                onClone: () => handleClone(category),
                onExport: () => handleExport(category),
                onDelete: () => handleRequestDelete(category),
              });

              return (
                <EntityCard
                  key={category.id}
                  title={equipmentCategoryEntityConfig.views.card.title(category)}
                  icon={equipmentCategoryEntityConfig.getIcon(category)}
                  iconColor={equipmentCategoryEntityConfig.getIconColor?.(category)}
                  details={[
                    {
                      key: 'equipment',
                      icon: equipmentCategoryEntityConfig.getIcon(category),
                      text: equipmentCount,
                      title: 'Снаряжение',
                    },
                  ]}
                  isSelected={activeId === category.id}
                  isMultiSelected={selectedCategoryIds.includes(category.id)}
                  onSelect={() => setActiveId(category.id)}
                  onMultiSelect={() => toggleCategorySelection(category.id)}
                  borderColor={equipmentCategoryEntityConfig.getBorderColor(category)}
                  menuItems={actions}
                  showMultiSelect={showMultiSelect}
                  viewMode={viewMode}
                />
              );
            })}
          </div>

          {/* Right Column with DetailPane */}
          <div className="lg:col-span-2 hidden lg:block max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 custom-scrollbar">
            {selectedCategory ? (
              <div className="h-full pl-1">
                <DetailPane
                  openSections={openSections}
                  onToggleSection={handleToggleSection}
                  sections={[
                    {
                      id: 'info',
                      title: 'Свойства категории',
                      icon: Info,
                      content: (
                        <div className="space-y-4">
                          <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                              Цвет метки
                            </label>
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-lg border border-border shadow-sm"
                                style={{ backgroundColor: selectedCategory.color }}
                              />
                              <span className="font-mono text-sm bg-background px-2 py-1 rounded border border-border">
                                {selectedCategory.color}
                              </span>
                            </div>
                          </div>
                        </div>
                      ),
                    },
                  ]}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-white shadow-sm"
                        style={{ backgroundColor: selectedCategory.color }}
                      >
                        <Layers className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">
                          {selectedCategory.name}
                        </h2>
                        <p className="text-muted-foreground">
                          {
                            equipmentStore.equipment.filter(
                              (e) => e.categoryId === selectedCategory.id
                            ).length
                          }{' '}
                          единиц снаряжения
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/equipment-categories/${selectedCategory.id}`)}
                    >
                      <Edit className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Изменить</span>
                    </Button>
                  </div>
                </DetailPane>
              </div>
            ) : (
              <div className="h-full flex items-start justify-center pt-16">
                <div className="text-center p-4">
                  <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Layers className="w-10 h-10 text-muted-foreground" />
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
          <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">
            {searchTerm || hasActiveFilters ? 'Категории не найдены' : 'Категорий пока нет'}
          </h3>
          {!searchTerm && !hasActiveFilters && (
            <Button onClick={() => navigate('/equipment-categories/new')} className="mt-4">
              <CirclePlus className="w-4 h-4 mr-2" />
              Добавить первую категорию
            </Button>
          )}
        </div>
      )}

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
          Это действие нельзя отменить. Все данные о категории будут потеряны.
        </p>
      </ConfirmModal>

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

export default EquipmentCategoriesPage;
