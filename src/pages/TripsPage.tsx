// src/pages/TripsPage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Backpack,
  Filter,
  MapPinPlus,
  Edit,
  Copy,
  Trash2,
  Share,
  Clock,
  Route,
} from 'lucide-react';
import { useTripsManagement } from '../hooks/useTripsManagement';
import TripFiltersComponent from '../components/trips/TripFiltersComponent';
import TripDetail from '../components/trips/TripDetail';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import AddParticipantsModal from '../components/trips/AddParticipantsModal';
import EntityCard from '../ui/EntityCard';
import { DIFFICULTY_CONFIG, STATUS_CONFIG } from '../constants/trips';
import { Users, MapPin, Calendar } from 'lucide-react';
import { formatDate } from '../utils';

const TripsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    // state
    activeId,
    filters,
    // showFormModal, // no longer used for editing
    // editingTrip, // no longer used for editing
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
    handleCloseModal,
    handleAddParticipant,
    handleSelectTrip,
  } = useTripsManagement();

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Заголовок и действия */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Походы</h1>
          <div className="flex items-center gap-2">
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
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full border-2 border-card" />
              )}
            </Button>
            <Button onClick={() => navigate('/trips/new')} variant="primary" size="default">
              <MapPinPlus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Создать поход</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      {showFilters && (
        <div className="mb-4 sm:mb-6 bg-card rounded-xl border p-3 sm:p-4">
          <TripFiltersComponent filters={filters} onFiltersChange={setFilters} />
        </div>
      )}

      {/* Основной контент */}
      {filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Список походов */}
          <div className="lg:col-span-1 space-y-3">
            {filteredTrips.map((trip) => {
              const difficultyConfig = DIFFICULTY_CONFIG[trip.difficulty];
              const statusConfig = STATUS_CONFIG[trip.effectiveStatus];
              const statusBorderColor =
                statusConfig.icon === Clock
                  ? '#f97316' // orange-600
                  : statusConfig.icon === Route
                    ? '#9333ea' // purple-600
                    : '#4b5563'; // gray-600

              const details = [
                {
                  key: 'status',
                  icon: statusConfig.icon,
                  text: statusConfig.label,
                  title: statusConfig.label,
                  className:
                    statusConfig.icon === Clock
                      ? 'text-orange-600 dark:text-orange-400'
                      : statusConfig.icon === Route
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-gray-600 dark:text-gray-400',
                },
                {
                  key: 'participants',
                  icon: Users,
                  text: trip.participants.length,
                  title: 'Участники',
                },
                ...(trip.destination
                  ? [{ key: 'destination', icon: MapPin, text: trip.destination, title: 'Место' }]
                  : []),
                ...(trip.startDate
                  ? [
                      {
                        key: 'date',
                        icon: Calendar,
                        text: formatDate(trip.startDate),
                        title: 'Дата',
                      },
                    ]
                  : []),
              ];

              const menuItems = [
                {
                  label: 'Редактировать',
                  icon: Edit,
                  onClick: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    navigate(`/trips/${trip.id}/edit`);
                  },
                },
                {
                  label: 'Клонировать',
                  icon: Copy,
                  onClick: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleClone(trip);
                  },
                },
                {
                  label: 'Экспорт',
                  icon: Share,
                  onClick: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleExport(trip);
                  },
                },
                {
                  label: 'Удалить',
                  icon: Trash2,
                  onClick: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleRequestDelete(trip);
                  },
                  className: 'text-danger',
                },
              ];

              return (
                <EntityCard
                  key={trip.id}
                  title={trip.name}
                  icon={difficultyConfig.icon}
                  iconColor={difficultyConfig.colorClassName}
                  details={details}
                  menuItems={menuItems}
                  isSelected={activeId === trip.id}
                  onSelect={() => handleSelectTrip(trip.id)}
                  borderColor={statusBorderColor}
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
              <div className="h-full flex items-center justify-center">
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
        </div>
      ) : (
        <div className="text-center py-16 px-6 text-muted-foreground">
          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">
            {hasActiveFilters ? 'Походы не найдены' : 'Походов пока нет'}
          </h3>
          {!hasActiveFilters && (
            <Button onClick={handleAddNew} className="mt-4">
              <MapPinPlus className="w-4 h-4 mr-2" />
              Создать первый поход
            </Button>
          )}
        </div>
      )}

      {/* Модальное окно деталей для мобильных устройств */}
      {activeId !== null && (
        <div className="lg:hidden">
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
    </div>
  );
};

export default TripsPage;
