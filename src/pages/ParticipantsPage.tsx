// src/pages/ParticipantsPage.tsx

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserRoundPlus,
  Filter,
  CirclePlus,
  Trash2,
  Copy,
  Share,
  X,
  Check,
  CheckCheck,
  LayoutList,
  Grid3X3,
  UploadCloud,
  MapPin,
  Backpack,
} from 'lucide-react';
import { useViewMode } from '../hooks/useViewMode';
import { useParticipantsManagement } from '../hooks/useParticipantsManagement';
import useParticipantStore from '../stores/useParticipantStore';
import useTripStore from '../stores/useTripStore';
import useEquipmentStore from '../stores/useEquipmentStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import type { Trip, Equipment, Participant } from '../types';
import ParticipantDetail from '../components/participants/ParticipantDetail';
import ParticipantFiltersComponent from '../components/participants/ParticipantFiltersComponent';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import Modal from '../ui/Modal';
import ParticipantForm from '../components/participants/ParticipantForm';
import EntityCard from '../ui/EntityCard';
import EntityListItem, { MetaItem } from '../ui/EntityListItem';
import {
  exportParticipantToJson,
  exportBulkParticipantsToJson,
  importDataFromJson,
} from '../utils/backup';
import SelectTripModal from '../components/participants/SelectTripModal';
import { participantEntityConfig } from '../config/entityConfig';
import { useIsMobile } from '../hooks/useIsMobile';

const ParticipantsPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const {
    activeId,
    filters,
    participantToDelete,
    showFilters,
    isSelectTripModalOpen,
    openSections,
    filteredParticipants,
    selectedParticipant,
    hasActiveFilters,
    setActiveId,
    setFilters,
    setParticipantToDelete,
    setShowFilters,
    setSelectTripModalOpen,
    handleToggleSection,
    handleRequestDelete,
    handleConfirmDelete,
    handleAddToTrip,
    handleConfirmAddToTrip,
  } = useParticipantsManagement();

  const { deleteParticipant, addParticipant, updateParticipant } = useParticipantStore();
  const getVisibleFields = useSettingsStore((state) => state.getVisibleFields);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<number[]>([]);
  const [showMultiSelect, setShowMultiSelect] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const { viewMode, toggleViewMode } = useViewMode('participants');
  const visibleFields = getVisibleFields('participants');

  // Локальное состояние для режима создания/редактирования
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleAddNew = () => {
    setIsCreating(true);
    setIsEditing(false);
    setActiveId(null); // Сбрасываем выделение
  };

  const handleEditStart = () => {
    if (selectedParticipant) {
      setIsEditing(true);
      setIsCreating(false);
    }
  };

  const handleFormCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
  };

  const handleFormSubmit = (data: any) => {
    if (isEditing && selectedParticipant) {
      updateParticipant(selectedParticipant.id, data);
      setIsEditing(false);
    } else {
      const newParticipant = addParticipant(data);
      setIsCreating(false);
      setActiveId(newParticipant.id);
    }
  };

  const handleClone = (participant: Participant) => {
    const { id, ...rest } = participant;
    const newData = { ...rest, name: `${participant.name} (Копия)` };
    addParticipant(newData);
  };

  const toggleMultiSelect = () => {
    setShowMultiSelect(!showMultiSelect);
    if (showMultiSelect) setSelectedParticipantIds([]);
  };

  const toggleParticipantSelection = (participantId: number) => {
    setSelectedParticipantIds((prev) =>
      prev.includes(participantId)
        ? prev.filter((id) => id !== participantId)
        : [...prev, participantId]
    );
  };

  const selectAllParticipants = () => {
    setSelectedParticipantIds(filteredParticipants.map((p) => p.id));
  };

  const exitMultiSelectMode = () => {
    setShowMultiSelect(false);
    setSelectedParticipantIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedParticipantIds.length === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  const handleConfirmBulkDelete = () => {
    selectedParticipantIds.forEach((id) => {
      if (id === activeId) setActiveId(null);
      deleteParticipant(id);
    });
    exitMultiSelectMode();
    setShowBulkDeleteConfirm(false);
  };

  const handleBulkClone = () => {
    if (selectedParticipantIds.length === 0) return;
    const selected = filteredParticipants.filter((p) => selectedParticipantIds.includes(p.id));
    selected.forEach((p) => handleClone(p));
  };

  const handleBulkExport = () => {
    if (selectedParticipantIds.length === 0) return;
    const selected = filteredParticipants.filter((p) => selectedParticipantIds.includes(p.id));
    exportBulkParticipantsToJson(selected);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importDataFromJson(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // При клике на карточку в списке
  const onSelectParticipant = (id: number) => {
    setActiveId(id);
    setIsCreating(false);
    setIsEditing(false);
  };

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
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Участники
          </h1>
          <div className="flex items-center gap-2">
            {!showMultiSelect ? (
              <>
                <Button
                  onClick={() => setShowFilters((s) => !s)}
                  variant="secondary"
                  size="icon"
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

                <Button onClick={toggleViewMode} variant="secondary" size="icon" title="Вид">
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
                  onClick={handleAddNew}
                  variant="primary"
                  size="default"
                  disabled={isCreating || isEditing}
                >
                  <UserRoundPlus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Добавить участника</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 h-10">
                  <span>{selectedParticipantIds.length}</span>
                  <span className="text-primary/70">из {filteredParticipants.length}</span>
                </div>
                <Button variant="secondary" size="icon" onClick={selectAllParticipants} title="Все">
                  <CheckCheck className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleBulkClone}
                  disabled={!selectedParticipantIds.length}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleBulkExport}
                  disabled={!selectedParticipantIds.length}
                >
                  <Share className="w-4 h-4" />
                </Button>
                <Button
                  variant="danger"
                  size="icon"
                  onClick={handleBulkDelete}
                  disabled={!selectedParticipantIds.length}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button onClick={exitMultiSelectMode} variant="ghost" size="icon">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 sm:mb-8 bg-card rounded-xl border border-border notion-shadow-xs p-4 sm:p-5">
          <ParticipantFiltersComponent filters={filters} onFiltersChange={setFilters} />
        </div>
      )}

      {filteredParticipants.length > 0 || isCreating ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Левая колонка: Список */}
          <div className="lg:col-span-1 space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 custom-scrollbar">
            {filteredParticipants.map((p) => {
              const tripCount = useTripStore
                .getState()
                .trips.filter((trip: Trip) => trip.participants.includes(p.id)).length;
              const equipmentCount = useEquipmentStore
                .getState()
                .equipment.filter((eq: Equipment) => eq.ownerId === p.id).length;

              const cardConfig = participantEntityConfig.views.card;
              const actions = participantEntityConfig.getActions({
                onEdit: () => {
                  setActiveId(p.id);
                  setIsEditing(true);
                  setIsCreating(false);
                },
                onAddToTrip: () => handleAddToTrip(p),
                onClone: () => handleClone(p),
                onExport: () => exportParticipantToJson(p),
                onDelete: () => handleRequestDelete(p),
              });

              const metaMap: Record<string, MetaItem | null> = {
                trips:
                  tripCount > 0
                    ? {
                        icon: MapPin,
                        text: tripCount,
                        tooltip: 'Количество походов',
                        className: 'text-foreground',
                      }
                    : null,
                equipment:
                  equipmentCount > 0
                    ? {
                        icon: Backpack,
                        text: equipmentCount,
                        tooltip: 'Предметов снаряжения',
                        className: 'text-foreground',
                      }
                    : null,
              };

              const metaItems = visibleFields
                .map((id) => metaMap[id])
                .filter((item): item is MetaItem => item !== null);

              return viewMode === 'compact' ? (
                <EntityListItem
                  key={p.id}
                  title={cardConfig.title(p)}
                  meta={metaItems}
                  borderColor={participantEntityConfig.getBorderColor(p)}
                  menuItems={actions}
                  isSelected={activeId === p.id}
                  isMultiSelected={selectedParticipantIds.includes(p.id)}
                  onSelect={() => onSelectParticipant(p.id)}
                  onMultiSelect={() => toggleParticipantSelection(p.id)}
                  showMultiSelect={showMultiSelect}
                  variant="info"
                />
              ) : (
                <EntityCard
                  key={p.id}
                  title={cardConfig.title(p)}
                  subtitle={cardConfig.subtitle && cardConfig.subtitle(p)}
                  icon={participantEntityConfig.getIcon(p)}
                  iconColor={participantEntityConfig.getIconColor?.(p)}
                  details={cardConfig
                    .details(p, { tripCount, equipmentCount })
                    .map((detail, index) => ({
                      ...detail,
                      key: `participant-detail-${index}`,
                    }))}
                  isSelected={activeId === p.id}
                  isMultiSelected={selectedParticipantIds.includes(p.id)}
                  onSelect={() => onSelectParticipant(p.id)}
                  onMultiSelect={() => toggleParticipantSelection(p.id)}
                  borderColor={participantEntityConfig.getBorderColor(p)}
                  menuItems={actions}
                  showMultiSelect={showMultiSelect}
                  variant="info"
                />
              );
            })}
          </div>

          {/* Правая колонка: Просмотр или Форма */}
          <div className="lg:col-span-2 hidden lg:block max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 custom-scrollbar">
            {isCreating ? (
              <div className="pl-1">
                <ParticipantForm
                  participant={null}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                />
              </div>
            ) : isEditing && selectedParticipant ? (
              <div className="pl-1">
                <ParticipantForm
                  participant={selectedParticipant}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                />
              </div>
            ) : selectedParticipant ? (
              <ParticipantDetail
                participant={selectedParticipant}
                onAddToTrip={() => selectedParticipant && handleAddToTrip(selectedParticipant)}
                onEdit={handleEditStart}
                openSections={openSections}
                onToggleSection={handleToggleSection}
              />
            ) : (
              <div className="h-full flex items-start justify-center pt-16">
                <div className="text-center p-4">
                  <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Выберите участника</h3>
                  <p className="text-muted-foreground">
                    Кликните на карточку для просмотра информации или создайте нового.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 px-6 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">
            {hasActiveFilters ? 'Участники не найдены' : 'Участников пока нет'}
          </h3>
          {!hasActiveFilters && (
            <Button onClick={handleAddNew} className="mt-4">
              <CirclePlus className="w-4 h-4 mr-2" />
              Добавить первого участника
            </Button>
          )}
        </div>
      )}

      {/* Модалки подтверждения удаления */}
      <ConfirmModal
        isOpen={!!participantToDelete}
        onClose={() => setParticipantToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Подтверждение"
        variant="danger"
        confirmText="Удалить"
      >
        <p>
          Вы уверены, что хотите удалить участника{' '}
          <span className="font-bold">{participantToDelete?.name}</span>?
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
        <p>Вы уверены, что хотите удалить {selectedParticipantIds.length} участников?</p>
      </ConfirmModal>

      {activeId && (
        <SelectTripModal
          isOpen={isSelectTripModalOpen}
          onClose={() => setSelectTripModalOpen(false)}
          onConfirm={handleConfirmAddToTrip}
          selectedCount={1}
          selectedIds={[activeId]}
        />
      )}

      {/* Mobile Detail Modal */}
      {isMobile && activeId !== null && (
        <Modal
          isOpen={activeId !== null}
          onClose={() => setActiveId(null)}
          title={selectedParticipant?.name || 'Детали'}
        >
          <ParticipantDetail
            participant={selectedParticipant}
            onAddToTrip={() => selectedParticipant && handleAddToTrip(selectedParticipant)}
            onEdit={() => selectedParticipant && handleEditStart()}
            openSections={openSections}
            onToggleSection={handleToggleSection}
          />
        </Modal>
      )}
    </div>
  );
};

export default ParticipantsPage;
