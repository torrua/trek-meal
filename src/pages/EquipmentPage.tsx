// src/pages/EquipmentPage.tsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CirclePlus,
  Filter,
  Backpack,
  Info,
  Trash2,
  Copy,
  Share,
  X,
  Check,
  CheckCheck,
  LayoutList,
  Grid3X3,
} from 'lucide-react';
import useEquipmentStore from '../stores/useEquipmentStore';
import useEquipmentCategoryStore from '../stores/useEquipmentCategoryStore';
import useParticipantStore from '../stores/useParticipantStore';
import useSearchStore from '../stores/useSearchStore';
import type { Equipment, EquipmentCategory, Participant } from '../types';
import EntityCard from '../ui/EntityCard';
import EquipmentFiltersComponent, {
  EquipmentFilters,
} from '../components/equipment/EquipmentFiltersComponent';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import DetailPane from '../ui/DetailPane';
import InfoField from '../ui/InfoField';
import { equipmentEntityConfig } from '../config/entityConfig';
import { Edit, ExternalLink, Scale, User, Users } from 'lucide-react';
import { useViewMode } from '../hooks/useViewMode';
import { exportEquipmentToJson } from '../utils/backup';

const EquipmentPage: React.FC = () => {
  const { equipment, deleteEquipment } = useEquipmentStore();
  const { categories } = useEquipmentCategoryStore();
  const { participants } = useParticipantStore();
  const { searchTerm } = useSearchStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(['info']);

  const [filters, setFilters] = useState<EquipmentFilters>({
    categoryId: 'all',
    type: 'all',
  });

  // Multi-selection state
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<number[]>([]);
  const [showMultiSelect, setShowMultiSelect] = useState(false);
  // Add state for bulk delete confirmation
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // View mode state
  const { viewMode, toggleViewMode } = useViewMode('equipment');

  useEffect(() => {
    const selectedId = searchParams.get('selectedId');
    if (selectedId && equipment.some((e) => e.id === Number(selectedId))) {
      setActiveId(Number(selectedId));
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, equipment, setSearchParams]);

  const filteredEquipment = useMemo(() => {
    return equipment
      .filter((e) => {
        const categoryMatch =
          filters.categoryId === 'all' || String(e.categoryId) === filters.categoryId;
        const typeMatch = filters.type === 'all' || e.type === filters.type;
        const searchMatch =
          !searchTerm.trim() ||
          e.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
          e.description?.toLowerCase().includes(searchTerm.trim().toLowerCase());
        return categoryMatch && typeMatch && searchMatch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [equipment, searchTerm, filters]);

  const selectedEquipment = useMemo(
    () => equipment.find((e) => e.id === activeId) || null,
    [activeId, equipment]
  );

  const handleAddNew = useCallback(() => {
    // Navigate to new equipment page
    window.location.href = '/equipment/new';
  }, []);

  const handleEdit = useCallback((equipment: Equipment) => {
    // Navigate to edit equipment page
    window.location.href = `/equipment/${equipment.id}`;
  }, []);

  const handleRequestDelete = useCallback((equipment: Equipment) => {
    setEquipmentToDelete(equipment);
  }, []);

  const handleConfirmDelete = () => {
    if (equipmentToDelete) {
      if (equipmentToDelete.id === activeId) setActiveId(null);
      deleteEquipment(equipmentToDelete.id);
      setEquipmentToDelete(null);
    }
  };

  const handleToggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const formatWeight = (weight: number) => {
    if (weight < 1000) {
      return `${weight} г`;
    }
    return `${(weight / 1000).toFixed(1)} кг`;
  };

  const hasActiveFilters = useMemo(
    () => filters.categoryId !== 'all' || filters.type !== 'all',
    [filters]
  );

  // Multi-selection handlers
  const toggleMultiSelect = () => {
    setShowMultiSelect(!showMultiSelect);
    if (showMultiSelect) {
      setSelectedEquipmentIds([]);
    }
  };

  const toggleEquipmentSelection = (equipmentId: number) => {
    setSelectedEquipmentIds((prev: number[]) =>
      prev.includes(equipmentId)
        ? prev.filter((id: number) => id !== equipmentId)
        : [...prev, equipmentId]
    );
  };

  const selectAllEquipment = () => {
    setSelectedEquipmentIds(filteredEquipment.map((equipmentItem: Equipment) => equipmentItem.id));
  };

  // Exit multi-select mode completely
  const exitMultiSelectMode = () => {
    setShowMultiSelect(false);
    setSelectedEquipmentIds([]);
  };

  // Bulk action handlers
  const handleBulkDelete = () => {
    if (selectedEquipmentIds.length === 0) return;
    // Show confirmation modal
    setShowBulkDeleteConfirm(true);
  };

  const handleConfirmBulkDelete = () => {
    // Delete all selected equipment directly using the store function
    selectedEquipmentIds.forEach((id) => {
      if (id === activeId) setActiveId(null);
      deleteEquipment(id);
    });
    // Exit multi-select mode
    exitMultiSelectMode();
    setShowBulkDeleteConfirm(false);
  };

  const handleBulkClone = () => {
    if (selectedEquipmentIds.length === 0) return;

    console.log(`Cloning equipment: ${selectedEquipmentIds.join(', ')}`);
  };

  const handleBulkExport = () => {
    if (selectedEquipmentIds.length === 0) return;

    console.log(`Exporting equipment: ${selectedEquipmentIds.join(', ')}`);
  };

  // Individual equipment actions
  const handleClone = useCallback((equipmentItem: Equipment) => {
    const { cloneEquipment } = useEquipmentStore.getState();
    cloneEquipment(equipmentItem.id);
  }, []);

  const handleExport = useCallback((equipmentItem: Equipment) => {
    try {
      exportEquipmentToJson(equipmentItem);
      // toast.success('Снаряжение экспортировано');
    } catch (error) {
      // toast.error('Ошибка при экспорте');
      console.error('Export error:', error);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Снаряжение
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

                <Button onClick={toggleMultiSelect} variant="secondary" size="default">
                  Выделить
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

                <Button onClick={handleAddNew} variant="primary" size="default">
                  <CirclePlus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Добавить снаряжение</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 h-10">
                  <span>{selectedEquipmentIds.length}</span>
                  <span className="text-primary/70">из {filteredEquipment.length} выделено</span>
                </div>

                <Button
                  variant="secondary"
                  size="icon"
                  onClick={selectAllEquipment}
                  disabled={selectedEquipmentIds.length === filteredEquipment.length}
                  title="Выделить все"
                >
                  <CheckCheck className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleBulkClone}
                    disabled={selectedEquipmentIds.length === 0}
                    title="Клонировать"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleBulkExport}
                    disabled={selectedEquipmentIds.length === 0}
                    title="Экспорт"
                  >
                    <Share className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="icon"
                    onClick={handleBulkDelete}
                    disabled={selectedEquipmentIds.length === 0}
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

      {showFilters && (
        <div className="mb-6 sm:mb-8 bg-card rounded-xl border border-border notion-shadow-xs p-4 sm:p-5">
          <EquipmentFiltersComponent filters={filters} onFiltersChange={setFilters} />
        </div>
      )}

      {filteredEquipment.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-1 space-y-3">
            {filteredEquipment.map((equipmentItem) => {
              const category = categories.find(
                (c: EquipmentCategory) => c.id === equipmentItem.categoryId
              );
              const owner = participants.find((p: Participant) => p.id === equipmentItem.ownerId);

              const cardConfig = equipmentEntityConfig.views.card;
              const actions = equipmentEntityConfig.getActions({
                onEdit: () => handleEdit(equipmentItem),
                onClone: () => handleClone(equipmentItem),
                onExport: () => handleExport(equipmentItem),
                onDelete: () => handleRequestDelete(equipmentItem),
              });
              const context = {
                category,
                owner,
                formattedWeight: formatWeight(equipmentItem.weight),
              };

              return (
                <EntityCard
                  key={equipmentItem.id}
                  title={cardConfig.title(equipmentItem)}
                  subtitle={cardConfig.subtitle?.(equipmentItem, context)}
                  icon={equipmentEntityConfig.getIcon(equipmentItem)}
                  iconColor={equipmentEntityConfig.getIconColor?.(equipmentItem, context)}
                  details={cardConfig.details(equipmentItem, context).map((detail, index) => ({
                    ...detail,
                    key: `equipment-detail-${index}`,
                  }))}
                  menuItems={actions}
                  isSelected={activeId === equipmentItem.id}
                  isMultiSelected={selectedEquipmentIds.includes(equipmentItem.id)}
                  onSelect={() => setActiveId(equipmentItem.id)}
                  onMultiSelect={() => toggleEquipmentSelection(equipmentItem.id)}
                  borderColor={equipmentEntityConfig.getBorderColor(equipmentItem, context)}
                  data-testid={`equipment-card-${equipmentItem.id}`}
                  showMultiSelect={showMultiSelect}
                  viewMode={viewMode}
                />
              );
            })}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-2 hidden lg:block sticky top-24 self-start max-h-[calc(100vh-7.5rem)]">
            {selectedEquipment ? (
              <DetailPane
                sections={[
                  {
                    id: 'info',
                    title: 'Основная информация',
                    icon: Info,
                    actionButton: (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(selectedEquipment)}
                        title="Редактировать снаряжение"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    ),
                    content: (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <InfoField
                            icon={Scale}
                            label="Вес"
                            value={formatWeight(selectedEquipment.weight)}
                          />
                          <InfoField
                            icon={selectedEquipment.type === 'personal' ? User : Users}
                            label="Тип"
                            value={selectedEquipment.type === 'personal' ? 'Личное' : 'Общее'}
                          />
                          {selectedEquipment.ownerId &&
                            (() => {
                              const owner = participants.find(
                                (p) => p.id === selectedEquipment.ownerId
                              );
                              return owner ? (
                                <InfoField icon={User} label="Владелец" value={owner.name} />
                              ) : null;
                            })()}
                        </div>
                        {selectedEquipment.description && (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                              Описание
                            </label>
                            <p className="text-foreground">{selectedEquipment.description}</p>
                          </div>
                        )}
                        {selectedEquipment.link && (
                          <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                              Ссылка
                            </label>
                            <a
                              href={selectedEquipment.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Открыть ссылку
                            </a>
                          </div>
                        )}
                      </div>
                    ),
                  },
                ]}
                openSections={openSections}
                onToggleSection={handleToggleSection}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <Backpack className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {selectedEquipment.name}
                      </h2>
                      <p className="text-muted-foreground">
                        {categories.find((c) => c.id === selectedEquipment.categoryId)?.name ||
                          'Без категории'}
                      </p>
                    </div>
                  </div>
                  <Button variant="secondary" onClick={() => handleEdit(selectedEquipment)}>
                    <Edit className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Редактировать</span>
                  </Button>
                </div>
              </DetailPane>
            ) : (
              <div className="h-full flex items-start justify-center pt-16">
                <div className="text-center p-4">
                  <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Backpack className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Выберите снаряжение</h3>
                  <p className="text-muted-foreground">
                    Кликните на карточку для просмотра подробной информации
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 px-6 text-muted-foreground">
          <Backpack className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">
            {searchTerm || hasActiveFilters ? 'Снаряжение не найдено' : 'Снаряжения пока нет'}
          </h3>
          {!searchTerm && !hasActiveFilters && (
            <Button onClick={handleAddNew} className="mt-4">
              <CirclePlus className="w-4 h-4 mr-2" />
              Добавить первое снаряжение
            </Button>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={!!equipmentToDelete}
        onClose={() => setEquipmentToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Удалить снаряжение"
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
      >
        Вы уверены, что хотите удалить снаряжение &quot;{equipmentToDelete?.name}&quot;? Это
        действие необратимо.
      </ConfirmModal>

      {/* Bulk delete confirmation */}
      <ConfirmModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleConfirmBulkDelete}
        title="Удалить снаряжение"
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
      >
        <p>
          Вы уверены, что хотите удалить {selectedEquipmentIds.length} единиц снаряжения?
          <br />
          <span className="text-sm text-muted-foreground mt-2 block">
            Снаряжение будет удалено безвозвратно.
          </span>
        </p>
      </ConfirmModal>
    </div>
  );
};

export default EquipmentPage;
