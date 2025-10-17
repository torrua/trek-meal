// src/pages/ParticipantsPage.tsx

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useParticipantsManagement } from '../hooks/useParticipantsManagement';
import useParticipantStore from '../stores/useParticipantStore';
import useTripStore from '../stores/useTripStore';
import useEquipmentStore from '../stores/useEquipmentStore';
import type { Trip, Equipment } from '../types';
import ParticipantDetail from '../components/participants/ParticipantDetail';
import ParticipantFiltersComponent from '../components/participants/ParticipantFiltersComponent';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import EntityCard from '../ui/EntityCard';
import { exportParticipantToJson } from '../utils/backup';
import SelectTripModal from '../components/participants/SelectTripModal';
import { participantEntityConfig } from '../config/entityConfig';

const ParticipantsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    // state
    activeId,
    filters,
    // showFormModal, // editing via routes now
    // editingParticipant,
    participantToDelete,
    showFilters,
    isSelectTripModalOpen,
    openSections,

    // data
    filteredParticipants,
    selectedParticipant,
    hasActiveFilters,

    // setters/actions
    setActiveId,
    setFilters,
    // setShowFormModal,
    setParticipantToDelete,
    setShowFilters,
    setSelectTripModalOpen,

    handleToggleSection,
    handleAddNew,
    handleClone,
    handleRequestDelete,
    handleConfirmDelete,
    handleAddToTrip,
    handleConfirmAddToTrip,
  } = useParticipantsManagement();

  // Get the delete function directly from the store
  const { deleteParticipant } = useParticipantStore();

  // Multi-selection state
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<number[]>([]);
  const [showMultiSelect, setShowMultiSelect] = useState(false);
  // Add state for bulk delete confirmation
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Multi-selection handlers
  const toggleMultiSelect = () => {
    setShowMultiSelect(!showMultiSelect);
    if (showMultiSelect) {
      setSelectedParticipantIds([]);
    }
  };

  const toggleParticipantSelection = (participantId: number) => {
    setSelectedParticipantIds((prev: number[]) =>
      prev.includes(participantId)
        ? prev.filter((id: number) => id !== participantId)
        : [...prev, participantId]
    );
  };

  const selectAllParticipants = () => {
    setSelectedParticipantIds(filteredParticipants.map((p) => p.id));
  };

  // Exit multi-select mode completely
  const exitMultiSelectMode = () => {
    setShowMultiSelect(false);
    setSelectedParticipantIds([]);
  };

  // Bulk action handlers
  const handleBulkDelete = () => {
    if (selectedParticipantIds.length === 0) return;
    // Show confirmation modal
    setShowBulkDeleteConfirm(true);
  };

  const handleConfirmBulkDelete = () => {
    // Delete all selected participants directly using the store function
    selectedParticipantIds.forEach((id) => {
      if (id === activeId) setActiveId(null);
      deleteParticipant(id);
    });
    // Exit multi-select mode
    exitMultiSelectMode();
    setShowBulkDeleteConfirm(false);
  };

  const handleBulkClone = () => {
    if (selectedParticipantIds.length === 0) return;

    console.log(`Cloning participants: ${selectedParticipantIds.join(', ')}`);
  };

  const handleBulkExport = () => {
    if (selectedParticipantIds.length === 0) return;

    console.log(`Exporting participants: ${selectedParticipantIds.join(', ')}`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Заголовок и кнопки */}
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
                <Button
                  onClick={() => navigate('/participants/new')}
                  variant="primary"
                  size="default"
                >
                  <UserRoundPlus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Добавить участника</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 h-10">
                  <span>{selectedParticipantIds.length}</span>
                  <span className="text-primary/70">из {filteredParticipants.length} выделено</span>
                </div>

                <Button
                  variant="secondary"
                  size="icon"
                  onClick={selectAllParticipants}
                  disabled={selectedParticipantIds.length === filteredParticipants.length}
                  title="Выделить все"
                >
                  <CheckCheck className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleBulkClone}
                    disabled={selectedParticipantIds.length === 0}
                    title="Клонировать"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleBulkExport}
                    disabled={selectedParticipantIds.length === 0}
                    title="Экспорт"
                  >
                    <Share className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="icon"
                    onClick={handleBulkDelete}
                    disabled={selectedParticipantIds.length === 0}
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
          <ParticipantFiltersComponent filters={filters} onFiltersChange={setFilters} />
        </div>
      )}

      {filteredParticipants.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Список участников */}
          <div className="lg:col-span-1 space-y-3">
            {filteredParticipants.map((p) => {
              const tripCount = useTripStore
                .getState()
                .trips.filter((trip: Trip) => trip.participants.includes(p.id)).length;
              const equipmentCount = useEquipmentStore
                .getState()
                .equipment.filter((eq: Equipment) => eq.ownerId === p.id).length;

              const cardConfig = participantEntityConfig.views.card;
              const actions = participantEntityConfig.getActions({
                onEdit: () => navigate(`/participants/${p.id}/edit`),
                onAddToTrip: () => handleAddToTrip(p),
                onClone: () => handleClone(p),
                onExport: () => exportParticipantToJson(p),
                onDelete: () => handleRequestDelete(p),
              });

              return (
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
                  onSelect={() => setActiveId(p.id)}
                  onMultiSelect={() => toggleParticipantSelection(p.id)}
                  borderColor={participantEntityConfig.getBorderColor(p)}
                  menuItems={actions}
                  showMultiSelect={showMultiSelect}
                />
              );
            })}
          </div>

          <div className="lg:col-span-2 hidden lg:block sticky top-24 self-start max-h-[calc(100vh-7.5rem)]">
            {selectedParticipant ? (
              <ParticipantDetail
                participant={selectedParticipant}
                onAddToTrip={() => selectedParticipant && handleAddToTrip(selectedParticipant)}
                onEdit={() =>
                  selectedParticipant && navigate(`/participants/${selectedParticipant.id}/edit`)
                }
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
                    Кликните на карточку для просмотра подробной информации.
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

      {/* Editing handled via Participant detail routes */}

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
          Вы уверены, что хотите удалить {selectedParticipantIds.length} участников?
          <br />
          <span className="text-sm text-muted-foreground mt-2 block">
            Это действие нельзя отменить. Все данные об участниках будут потеряны.
          </span>
        </p>
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
    </div>
  );
};

export default ParticipantsPage;
