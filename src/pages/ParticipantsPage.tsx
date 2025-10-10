// src/pages/ParticipantsPage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserRoundPlus, Filter, CirclePlus } from 'lucide-react';
import { useParticipantsManagement } from '../hooks/useParticipantsManagement';
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

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Заголовок и кнопки */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Участники</h1>
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
            <Button onClick={() => navigate('/participants/new')} variant="primary" size="default">
              <UserRoundPlus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Добавить участника</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      {showFilters && (
        <div className="mb-4 sm:mb-6 bg-card rounded-xl border p-3 sm:p-4">
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
                  onSelect={() => setActiveId(p.id)}
                  borderColor={participantEntityConfig.getBorderColor(p)}
                  menuItems={actions}
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
              <div className="h-full flex items-center justify-center">
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
