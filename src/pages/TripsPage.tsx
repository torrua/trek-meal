// src/pages/TripsPage.tsx

import React, { useState, useMemo, useCallback } from 'react';
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
import useTripStore from '../stores/useTripStore';
import useSearchStore from '../stores/useSearchStore';
import type { Trip, TripData } from '../types';
import TripFiltersComponent, { TripFilters } from '../components/trips/TripFiltersComponent';
import TripDetail from '../components/trips/TripDetail';
import TripForm from '../components/trips/TripForm';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import { toast } from 'react-hot-toast';
import { exportTripToJson } from '../utils/backup';
import AddParticipantsModal from '../components/trips/AddParticipantsModal';
import EntityCard from '../ui/EntityCard';
import { getEffectiveStatus } from '../utils/index';
import { DIFFICULTY_CONFIG, STATUS_CONFIG } from '../constants/trips';
import { Users, MapPin, Calendar } from 'lucide-react';
import { formatDate } from '../utils';

const TripsPage: React.FC = () => {
  const { trips, addTrip, deleteTrip, updateTrip } = useTripStore();
  const { searchTerm } = useSearchStore();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [filters, setFilters] = useState<TripFilters>({ status: 'all', difficulty: 'all' });
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [isAddParticipantModalOpen, setAddParticipantModalOpen] = useState(false);

  // Мемоизация для оптимизации производительности
  const filteredTrips = useMemo(() => {
    let result = trips.map((t) => ({ ...t, effectiveStatus: getEffectiveStatus(t) }));

    // Фильтрация по поисковому запросу
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(search) ||
          t.destination?.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search)
      );
    }

    // Фильтрация по статусу и сложности
    result = result.filter((t) => {
      if (filters.status !== 'all' && t.effectiveStatus !== filters.status) return false;
      if (filters.difficulty !== 'all' && t.difficulty !== filters.difficulty) return false;
      return true;
    });

    // Сортировка по дате создания (новые сверху)
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [trips, searchTerm, filters]);

  const selectedTrip = useMemo(() => trips.find((t) => t.id === activeId), [activeId, trips]);

  const handleAddNew = useCallback(() => {
    setEditingTrip(null);
    setShowFormModal(true);
  }, []);

  const handleEdit = useCallback((trip: Trip) => {
    setEditingTrip(trip);
    setShowFormModal(true);
  }, []);

  const handleFormSubmit = useCallback(
    (formData: TripData) => {
      try {
        if (editingTrip) {
          updateTrip(editingTrip.id, formData);
          toast.success(`Поход "${formData.name}" обновлен.`);
        } else {
          const newTrip = addTrip(formData);
          if (newTrip) {
            setActiveId(newTrip.id);
            toast.success(`Поход "${formData.name}" создан.`);
          }
        }
        setShowFormModal(false);
        setEditingTrip(null);
      } catch (error) {
        toast.error('Произошла ошибка при сохранении похода');
        console.error('Error saving trip:', error);
      }
    },
    [editingTrip, addTrip, updateTrip]
  );

  const handleClone = useCallback(
    (trip: Trip) => {
      try {
        const { name, participants: _p, ...rest } = trip;
        const clonedTripData: TripData = {
          ...rest,
          name: `${name} (копия)`,
          participants: [],
        };
        const newTrip = addTrip(clonedTripData);
        if (newTrip) {
          setActiveId(newTrip.id);
          toast.success(`Поход "${trip.name}" клонирован.`);
        }
      } catch (error) {
        toast.error('Ошибка при клонировании похода');
        console.error('Error cloning trip:', error);
      }
    },
    [addTrip]
  );

  const handleExport = useCallback((trip: Trip) => {
    try {
      exportTripToJson(trip);
      toast.success('Поход экспортирован');
    } catch (error) {
      toast.error('Ошибка при экспорте');
      console.error('Export error:', error);
    }
  }, []);

  const handleRequestDelete = useCallback((trip: Trip) => setTripToDelete(trip), []);

  const handleConfirmDelete = useCallback(() => {
    if (tripToDelete) {
      try {
        if (tripToDelete.id === activeId) setActiveId(null);
        deleteTrip(tripToDelete.id);
        setTripToDelete(null);
        toast.success(`Поход "${tripToDelete.name}" удален`);
      } catch (error) {
        toast.error('Ошибка при удалении похода');
        console.error('Delete error:', error);
      }
    }
  }, [tripToDelete, activeId, deleteTrip]);

  const handleCloseModal = useCallback(() => {
    setShowFormModal(false);
    setEditingTrip(null);
  }, []);

  const handleAddParticipant = useCallback(() => {
    if (selectedTrip) setAddParticipantModalOpen(true);
  }, [selectedTrip]);

  const handleSelectTrip = useCallback((tripId: number) => {
    setActiveId(tripId);
  }, []);

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((v) => v !== 'all'),
    [filters]
  );

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
            <Button onClick={handleAddNew} variant="primary" size="default">
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
                ? [{ key: 'date', icon: Calendar, text: formatDate(trip.startDate), title: 'Дата' }]
                : []),
            ];

            const menuItems = [
              {
                label: 'Редактировать',
                icon: Edit,
                onClick: (e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleEdit(trip);
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

          {/* Пустое состояние */}
          {filteredTrips.length === 0 && (
            <div className="text-center py-16 px-6 text-muted-foreground">
              <Backpack className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground">
                {searchTerm || hasActiveFilters ? 'Походы не найдены' : 'Походов пока нет'}
              </h3>
              {!searchTerm && !hasActiveFilters && (
                <Button onClick={handleAddNew} className="mt-4">
                  <MapPinPlus className="w-4 h-4 mr-2" />
                  Создать первый поход
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Детали похода */}
        <div className="lg:col-span-2 hidden lg:block sticky top-24 self-start max-h-[calc(100vh-7.5rem)]">
          {selectedTrip ? (
            <TripDetail
              trip={selectedTrip}
              onEdit={() => selectedTrip && handleEdit(selectedTrip)}
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

      {/* Модальное окно формы */}
      <Modal
        isOpen={showFormModal}
        onClose={handleCloseModal}
        title={editingTrip ? 'Редактирование похода' : 'Новый поход'}
      >
        <TripForm trip={editingTrip} onSubmit={handleFormSubmit} onCancel={handleCloseModal} />
      </Modal>

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
