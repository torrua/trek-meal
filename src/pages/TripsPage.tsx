// src/pages/TripsPage.tsx

import React, { useState, useRef } from 'react';
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
  CheckSquare,
  LayoutList,
  Grid3X3,
  Download,
  CheckCheck,
} from 'lucide-react';
import { useTripsManagement } from '../hooks/useTripsManagement';
import { useViewMode } from '../hooks/useViewMode';
import useTripStore from '../stores/useTripStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import TripFiltersComponent from '../components/trips/TripFiltersComponent';
import TripDetail from '../components/trips/TripDetail';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import AddParticipantsModal from '../components/trips/AddParticipantsModal';
import EntityCard from '../ui/EntityCard';
import EntityListItem, { MetaItem } from '../ui/EntityListItem';
import TripForm from '../components/trips/TripForm';
import type { Trip, TripData } from '../types'; // Import TripData
import { tripEntityConfig } from '../config/entityConfig';
import { useIsMobile } from '../hooks/useIsMobile';
import { formatDate } from '../utils';
import { exportBulkTripsToJson, importDataFromJson } from '../utils/backup';

const TripsPage: React.FC = () => {
  const _navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const { viewMode, toggleViewMode } = useViewMode('trips');
  const getVisibleFields = useSettingsStore((state) => state.getVisibleFields);
  const {
    activeId,
    filters,
    showFilters,
    tripToDelete,
    isAddParticipantModalOpen,
    filteredTrips,
    selectedTrip,
    hasActiveFilters,
    setActiveId,
    setFilters,
    setShowFilters,
    setAddParticipantModalOpen,
    setTripToDelete,
    handleExport,
    handleRequestDelete,
    handleConfirmDelete,
    handleAddParticipant,
  } = useTripsManagement();

  const { deleteTrip, addTrip, updateTrip } = useTripStore();
  const [selectedTripIds, setSelectedTripIds] = useState<number[]>([]);
  const [showMultiSelect, setShowMultiSelect] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const visibleFields = getVisibleFields('trips');

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleAddNew = () => {
    setIsCreating(true);
    setIsEditing(false);
    setActiveId(null);
  };

  const handleEditStart = () => {
    if (selectedTrip) {
      setIsEditing(true);
      setIsCreating(false);
    }
  };

  const handleFormCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
  };

  // Use TripData type instead of any
  const handleFormSubmit = (data: TripData) => {
    if (isEditing && selectedTrip) {
      updateTrip(selectedTrip.id, data);
      setIsEditing(false);
    } else {
      const newTrip = addTrip(data);
      if (newTrip) {
        setIsCreating(false);
        setActiveId(newTrip.id);
      }
    }
  };

  const handleClone = (trip: Trip) => {
    // cloneTrip functionality not implemented yet
    console.log('Clone trip:', trip.id);
  };

  const onSelectTrip = (id: number) => {
    setActiveId(activeId === id ? null : id);
    setIsCreating(false);
    setIsEditing(false);
  };

  const _getTripDetails = (_trip: Trip): MetaItem[] => {
    const details: MetaItem[] = [
      {
        icon: Users,
        text: _trip.participants.length,
        tooltip: 'Участники',
      },
    ];

    if (_trip.destination) {
      details.push({
        icon: MapPin,
        text: _trip.destination,
        tooltip: 'Место',
      });
    }

    if (_trip.startDate) {
      details.push({
        icon: Calendar,
        text: formatDate(_trip.startDate),
        tooltip: 'Дата',
      });
    }

    return details;
  };

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

  const exitMultiSelectMode = () => {
    setShowMultiSelect(false);
    setSelectedTripIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedTripIds.length === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  const handleConfirmBulkDelete = () => {
    selectedTripIds.forEach((id) => {
      if (id === activeId) setActiveId(null);
      deleteTrip(id);
    });
    exitMultiSelectMode();
    setShowBulkDeleteConfirm(false);
  };

  const handleBulkClone = () => {
    if (selectedTripIds.length === 0) return;
    const selected = filteredTrips.filter((t) => selectedTripIds.includes(t.id));
    selected.forEach((t) => handleClone(t));
  };

  const handleBulkExport = () => {
    if (selectedTripIds.length === 0) return;
    const selected = filteredTrips.filter((t) => selectedTripIds.includes(t.id));
    exportBulkTripsToJson(selected);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importDataFromJson(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <Download className="w-4 h-4" />
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
                  <CheckSquare className="w-4 h-4" />
                </Button>
                <Button onClick={handleAddNew} variant="primary" size="icon">
                  <MapPinPlus className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 h-10">
                  <span>{selectedTripIds.length}</span>
                  <span className="text-primary/70">из {filteredTrips.length}</span>
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

      {showFilters && (
        <div className="mb-6 sm:mb-8 bg-card rounded-xl border border-border shadow-sm p-4 sm:p-5">
          <TripFiltersComponent filters={filters} onFiltersChange={setFilters} />
        </div>
      )}

      {filteredTrips.length > 0 || isCreating ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-1 space-y-3 overflow-y-auto max-h-[calc(100vh-12rem)] pr-2 custom-scrollbar pl-1 pb-4 pt-2">
            {filteredTrips.map((trip) => {
              const cardConfig = tripEntityConfig.views.card;
              const actions = tripEntityConfig.getActions({
                onEdit: () => {
                  setActiveId(trip.id);
                  setIsEditing(true);
                  setIsCreating(false);
                },
                onClone: () => handleClone(trip),
                onExport: () => handleExport(trip),
                onDelete: () => handleRequestDelete(trip),
              });

              const entityActions = actions.map((action) => ({
                ...action,
                onClick: (e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  action.onClick();
                },
              }));

              const entityListActions = actions.map((action) => ({
                ...action,
                onClick: (e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  action.onClick();
                },
              }));

              const metaMap: Record<string, MetaItem | null> = {
                startDate: trip.startDate
                  ? {
                      icon: Calendar,
                      text: formatDate(trip.startDate),
                      tooltip: 'Дата начала',
                    }
                  : null,
                destination: trip.destination
                  ? {
                      icon: MapPin,
                      text: trip.destination,
                      tooltip: 'Место назначения',
                    }
                  : null,
                participants:
                  trip.participants.length > 0
                    ? {
                        icon: Users,
                        text: trip.participants.length as number,
                        tooltip: 'Участников',
                      }
                    : null,
              };

              const metaItems = visibleFields
                .map((id) => metaMap[id])
                .filter((item): item is MetaItem => item !== null);

              return viewMode === 'compact' ? (
                <EntityListItem
                  key={trip.id}
                  title={cardConfig.title(trip)}
                  meta={metaItems}
                  menuItems={entityListActions}
                  variant="trip"
                />
              ) : (
                <EntityCard
                  key={trip.id}
                  title={cardConfig.title(trip)}
                  subtitle={cardConfig.subtitle?.(trip)}
                  icon={tripEntityConfig.getIcon(trip)}
                  iconColor={tripEntityConfig.getIconColor?.(trip)}
                  variant="trip"
                  details={[
                    {
                      key: 'dates',
                      icon: Calendar,
                      text: trip.startDate ? formatDate(trip.startDate) : 'Нет даты',
                      title: 'Начало',
                    },
                    {
                      key: 'participants',
                      icon: Users,
                      text: trip.participants.length,
                      title: 'Участники',
                    },
                  ]}
                  isSelected={activeId === trip.id}
                  isMultiSelected={selectedTripIds.includes(trip.id)}
                  onSelect={() => onSelectTrip(trip.id)}
                  onMultiSelect={() => toggleTripSelection(trip.id)}
                  id={trip.id}
                  onToggleMultiSelect={() => {
                    if (!showMultiSelect) {
                      setShowMultiSelect(true);
                      setSelectedTripIds([trip.id]);
                    }
                  }}
                  menuItems={entityActions}
                  showMultiSelect={showMultiSelect}
                />
              );
            })}
          </div>

          <div className="lg:col-span-2 hidden lg:block max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 custom-scrollbar pt-2">
            {isCreating ? (
              <div className="pl-1">
                <TripForm trip={null} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
              </div>
            ) : isEditing && selectedTrip ? (
              <div className="pl-1">
                <TripForm
                  trip={selectedTrip}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                />
              </div>
            ) : selectedTrip ? (
              <TripDetail
                trip={selectedTrip}
                onEdit={handleEditStart}
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
                    handleEditStart();
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
            <Button onClick={handleAddNew} className="mt-4">
              <MapPinPlus className="w-4 h-4 mr-2" />
              Создать первый поход
            </Button>
          )}
        </div>
      )}

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

      <AddParticipantsModal
        isOpen={isAddParticipantModalOpen}
        onClose={() => setAddParticipantModalOpen(false)}
        tripId={activeId}
      />

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
