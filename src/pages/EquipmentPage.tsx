// src/pages/EquipmentPage.tsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CirclePlus,
  Filter,
  Backpack,
  Edit,
  Trash2,
  Scale,
  User,
  Users,
  ExternalLink,
  Info,
  Package,
} from 'lucide-react';
import useEquipmentStore from '../stores/useEquipmentStore';
import useEquipmentCategoryStore from '../stores/useEquipmentCategoryStore';
import useParticipantStore from '../stores/useParticipantStore';
import useSearchStore from '../stores/useSearchStore';
import type { Equipment, EquipmentData, EquipmentCategory, Participant } from '../types';
import EntityCard, { MenuItem } from '../ui/EntityCard';
import EquipmentListItem from '../components/equipment/EquipmentListItem';
import EquipmentForm from '../components/equipment/EquipmentForm';
import EquipmentFiltersComponent, {
  EquipmentFilters,
} from '../components/equipment/EquipmentFiltersComponent';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import DetailPane from '../ui/DetailPane';
import InfoField from '../ui/InfoField';

const EquipmentPage: React.FC = () => {
  const { equipment, addEquipment, updateEquipment, deleteEquipment } = useEquipmentStore();
  const { categories } = useEquipmentCategoryStore();
  const { participants } = useParticipantStore();
  const { searchTerm } = useSearchStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(['info']);

  const [filters, setFilters] = useState<EquipmentFilters>({
    categoryId: 'all',
    type: 'all',
  });

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
    setEditingEquipment(null);
    setFormModalOpen(true);
  }, []);

  const handleEdit = useCallback((equipment: Equipment) => {
    setEditingEquipment(equipment);
    setFormModalOpen(true);
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

  const handleFormSubmit = (formData: EquipmentData) => {
    if (editingEquipment) {
      updateEquipment(editingEquipment.id, formData);
    } else {
      addEquipment(formData);
    }
    setFormModalOpen(false);
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

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Снаряжение</h1>
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
              <span className="hidden sm:inline">Добавить снаряжение</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-4 sm:mb-6 bg-card rounded-xl border p-3 sm:p-4">
          <EquipmentFiltersComponent filters={filters} onFiltersChange={setFilters} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-1 space-y-3">
          {filteredEquipment.length === 0 ? (
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
          ) : (
            filteredEquipment.map((equipmentItem) => {
              const category = categories.find(
                (c: EquipmentCategory) => c.id === equipmentItem.categoryId
              );
              const owner = participants.find((p: Participant) => p.id === equipmentItem.ownerId);

              const details = [
                {
                  icon: Scale,
                  text: formatWeight(equipmentItem.weight),
                  title: 'Вес',
                },
                {
                  icon: equipmentItem.type === 'personal' ? User : Users,
                  text: equipmentItem.type === 'personal' ? 'Личное' : 'Общее',
                  title: 'Тип снаряжения',
                },
              ];

              // Add owner info if exists
              if (owner) {
                details.push({
                  icon: User,
                  text: owner.name,
                  title: 'Владелец',
                });
              }

              const menuItems: MenuItem[] = [
                {
                  label: 'Редактировать',
                  icon: Edit,
                  onClick: () => handleEdit(equipmentItem),
                },
                {
                  label: 'Удалить',
                  icon: Trash2,
                  onClick: () => handleRequestDelete(equipmentItem),
                  className:
                    'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
                },
              ];

              return (
                <EntityCard
                  key={equipmentItem.id}
                  title={equipmentItem.name}
                  subtitle={category?.name}
                  icon={Backpack}
                  iconColor={category?.color}
                  details={details}
                  menuItems={menuItems}
                  isSelected={activeId === equipmentItem.id}
                  onSelect={() => setActiveId(equipmentItem.id)}
                  borderColor={category?.color}
                  data-testid={`equipment-card-${equipmentItem.id}`}
                />
              );
            })
          )}
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
                        <div>
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
                {
                  id: 'category',
                  title: 'Категория',
                  icon: Package,
                  content: (
                    <div>
                      {selectedEquipment.categoryId ? (
                        (() => {
                          const category = categories.find(
                            (c) => c.id === selectedEquipment.categoryId
                          );
                          return category ? (
                            <div
                              className="p-3 rounded-lg border-l-4"
                              style={{ borderLeftColor: category.color }}
                            >
                              <div className="flex items-center gap-2">
                                {category.emoji && (
                                  <span className="text-lg">{category.emoji}</span>
                                )}
                                <span className="font-medium text-foreground">{category.name}</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-muted-foreground">Категория не найдена</p>
                          );
                        })()
                      ) : (
                        <p className="text-muted-foreground">Категория не назначена</p>
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
                    <h2 className="text-2xl font-bold text-foreground">{selectedEquipment.name}</h2>
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
            <div className="h-full flex items-center justify-center">
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

      {/* Equipment Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingEquipment ? 'Редактировать снаряжение' : 'Добавить снаряжение'}
        size="lg"
      >
        <EquipmentForm
          equipment={editingEquipment}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormModalOpen(false)}
        />
      </Modal>

      {/* Delete confirmation */}
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
    </div>
  );
};

export default EquipmentPage;
