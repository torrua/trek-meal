// src/pages/TripsPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Backpack,
  Filter,
  MapPinPlus,
  MapPin,
  Users,
  Calendar,
  Trash2,
  Copy,
  Share,
  X,
  Check,
  CheckCheck,
} from 'lucide-react';
import { useTripsManagement } from '../hooks/useTripsManagement';
import useTripStore from '../stores/useTripStore';
import TripFiltersComponent from '../components/trips/TripFiltersComponent';
import TripDetail from '../components/trips/TripDetail';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import AddParticipantsModal from '../components/trips/AddParticipantsModal';
import EntityCard from '../ui/EntityCard';
import { tripEntityConfig } from '../config/entityConfig';
import { useIsMobile } from '../hooks/useIsMobile';
import { formatDate } from '../utils';
import type { Trip } from '../types';

const TripsPage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    // state
    activeId,
    filters,
    showFilters,
    tripToDelete,
    isAddParticipantModalOpen,

    // data
    filteredTrips,
    selectedTrip,
    hasActiveFilters,

    // setters/actions
    setActiveId,
    setFilters,
    setShowFilters,
    setAddParticipantModalOpen,
    setTripToDelete,

    handleAddNew,
    handleEdit,
    handleClone,
    handleExport,
    handleRequestDelete,
    handleConfirmDelete,
    handleAddParticipant,
    handleSelectTrip,
  } = useTripsManagement();

  // Get the delete function directly from the store
  const { deleteTrip } = useTripStore();

  // Multi-selection state
  const [selectedTripIds, setSelectedTripIds] = useState<number[]>([]);
  const [showMultiSelect, setShowMultiSelect] = useState(false);
  // Add state for bulk delete confirmation
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Function to transform trip details to match EntityCard's DetailItem type
  const getTripDetails = (trip: any) => {
    const details = [
      {
        key: 'participants',
        icon: Users,
        text: trip.participants.length,
        title: 'Участники',
      },
    ];

    if (trip.destination) {
      details.push({
        key: 'destination',
        icon: MapPin,
        text: trip.destination,
        title: 'Место',
      });
    }

    if (trip.startDate) {
      details.push({
        key: 'startDate',
        icon: Calendar,
        text: formatDate(trip.startDate),
        title: 'Дата',
      });
    }

    return details;
  };

  // Multi-selection handlers
  const toggleMultiSelect = () => {
    setShowMultiSelect(!showMultiSelect);
    if (showMultiSelect) {
      setSelectedTripIds([]);
    }
  };

  const toggleTripSelection = (tripId: number) => {
    setSelectedTripIds((prev) =>
      prev.includes(tripId) ? prev.filter((id) => id !== tripId) : [...prev, tripId]
    );
  };

  const selectAllTrips = () => {
    setSelectedTripIds(filteredTrips.map((trip) => trip.id));
  };

  const clearSelection = () => {
    setSelectedTripIds([]);
  };

  // Exit multi-select mode completely
  const exitMultiSelectMode = () => {
    setShowMultiSelect(false);
    setSelectedTripIds([]);
  };

  // Bulk action handlers
  const handleBulkDelete = () => {
    if (selectedTripIds.length === 0) return;
    // Show confirmation modal
    setShowBulkDeleteConfirm(true);
  };

  const handleConfirmBulkDelete = () => {
    // Delete all selected trips directly using the store function
    selectedTripIds.forEach((id) => {
      if (id === activeId) setActiveId(null);
      deleteTrip(id);
    });
    // Exit multi-select mode
    exitMultiSelectMode();
    setShowBulkDeleteConfirm(false);
  };

  const handleBulkClone = () => {
    if (selectedTripIds.length === 0) return;

    console.log(`Cloning trips: ${selectedTripIds.join(', ')}`);
  };

  const handleBulkExport = () => {
    if (selectedTripIds.length === 0) return;

    console.log(`Exporting trips: ${selectedTripIds.join(', ')}`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Заголовок и действия */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Походы
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
                <Button onClick={() => navigate('/trips/new')} variant="primary" size="default">
                  <MapPinPlus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Создать поход</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 h-10">
                  <span>{selectedTripIds.length}</span>
                  <span className="text-primary/70">из {filteredTrips.length} выделено</span>
                </div>

                <Button
                  variant="secondary"
                  size="icon"
                  onClick={selectAllTrips}
                  disabled={selectedTripIds.length === filteredTrips.length}
                  title="Выделить все"
                >
                  <CheckCheck className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleBulkClone}
                    disabled={selectedTripIds.length === 0}
                    title="Клонировать"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleBulkExport}
                    disabled={selectedTripIds.length === 0}
                    title="Экспорт"
                  >
                    <Share className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="icon"
                    onClick={handleBulkDelete}
                    disabled={selectedTripIds.length === 0}
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
          <TripFiltersComponent filters={filters} onFiltersChange={setFilters} />
        </div>
      )}

      {filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Список походов */}
          <div className="lg:col-span-1 space-y-3">
            {filteredTrips.map((trip) => {
              const cardConfig = tripEntityConfig.views.card;
              const actions = tripEntityConfig.getActions({
                onEdit: () => navigate(`/trips/${trip.id}/edit`),
                onClone: () => handleClone(trip),
                onExport: () => handleExport(trip),
                onDelete: () => handleRequestDelete(trip),
              });

              return (
                <EntityCard
                  key={trip.id}
                  title={cardConfig.title(trip)}
                  subtitle={cardConfig.subtitle && cardConfig.subtitle(trip)}
                  icon={tripEntityConfig.getIcon(trip)}
                  iconColor={tripEntityConfig.getIconColor && tripEntityConfig.getIconColor(trip)}
                  details={getTripDetails(trip)}
                  menuItems={actions}
                  isSelected={activeId === trip.id}
                  isMultiSelected={selectedTripIds.includes(trip.id)}
                  onSelect={() => handleSelectTrip(trip.id)}
                  onMultiSelect={() => toggleTripSelection(trip.id)}
                  borderColor={tripEntityConfig.getBorderColor(trip)}
                  showMultiSelect={showMultiSelect}
                />
              );
            })}
          </div>

          {/* Детали похода */}
          <div className="lg:col-span-2 hidden lg:block sticky top-24 self-start max-h-[calc(100vh-7.5rem)]">
            {selectedTrip ? (
              <TripDetail
                trip={selectedTrip}
                onEdit={() => selectedTrip && navigate(`/trips/${selectedTrip.id}/edit`)}
                onAddParticipant={handleAddParticipant}
              />
            ) : (
              <div className="h-full flex items-start justify-center pt-16">
                <div className="text-center p-4">
                  <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Backpack className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Выберите поход</h3>
                  <p className="text-muted-foreground">
                    Кликните на карточку для просмотра подробной информации.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Модальное окно деталей для мобильных устройств */}
          {isMobile && activeId !== null && (
            <Modal
              isOpen={activeId !== null}
              onClose={() => setActiveId(null)}
              title={selectedTrip?.name || 'Детали'}
            >
              <TripDetail
                trip={selectedTrip ?? null}
                onEdit={() => {
                  if (selectedTrip) {
                    handleEdit(selectedTrip);
                    setActiveId(null);
                  }
                }}
                onAddParticipant={handleAddParticipant}
              />
            </Modal>
          )}
        </div>
      ) : (
        <div className="text-center py-16 px-6 text-muted-foreground">
          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">
            {hasActiveFilters ? 'Походы не найдены' : 'Походов пока нет'}
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            {hasActiveFilters
              ? 'Попробуйте изменить параметры фильтрации'
              : 'Создайте свой первый поход, чтобы начать планирование'}
          </p>
          {!hasActiveFilters && (
            <Button onClick={() => navigate('/trips/new')} className="mt-4">
              <MapPinPlus className="w-4 h-4 mr-2" />
              Создать первый поход
            </Button>
          )}
        </div>
      )}

      {/* Editing handled via TripDetailPage routes */}

      {/* Подтверждение удаления */}
      <ConfirmModal
        isOpen={!!tripToDelete}
        onClose={() => setTripToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Подтверждение"
        variant="danger"
        confirmText="Удалить"
      >
        <p>
          Вы уверены, что хотите удалить поход{' '}
          <span className="font-bold">{tripToDelete?.name}</span>?
          <br />
          <span className="text-sm text-muted-foreground mt-2 block">
            Это действие нельзя отменить. Все данные о походе будут потеряны.
          </span>
        </p>
      </ConfirmModal>

      {/* Модальное окно добавления участников */}
      <AddParticipantsModal
        isOpen={isAddParticipantModalOpen}
        onClose={() => setAddParticipantModalOpen(false)}
        tripId={activeId}
      />

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
          Вы уверены, что хотите удалить {selectedTripIds.length} походов?
          <br />
          <span className="text-sm text-muted-foreground mt-2 block">
            Это действие нельзя отменить. Все данные о походах будут потеряны.
          </span>
        </p>
      </ConfirmModal>
    </div>
  );
};

export default TripsPage;
