// src/components/trips/TripsPage.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { Backpack, Filter, MapPinPlus } from 'lucide-react';
import useTripStore from '../../stores/useTripStore';
import useSearchStore from '../../stores/useSearchStore';
import type { Trip, TripData, TripStatus } from '../../types';
import TripCard from './TripCard';
import TripDetail from './TripDetail';
import TripFiltersComponent, { TripFilters } from './TripFiltersComponent';
import TripForm from './TripForm';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import ConfirmModal from '../../ui/ConfirmModal';
import { toast } from 'react-hot-toast';
import { exportTripToJson } from '../../utils/backup';
import AddParticipantsModal from './AddParticipantsModal';
import { isPast, isFuture, parseISO } from 'date-fns';

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

  const getEffectiveStatus = useCallback((trip: Trip): TripStatus => {
    if (!trip.startDate || !trip.endDate) {
      return 'planning';
    }
    const start = parseISO(trip.startDate);
    const end = parseISO(trip.endDate);
    if (isPast(end)) return 'completed';
    if (isFuture(start)) return 'planning';
    return 'active';
  }, []);

  const filteredTrips = useMemo(() => {
    let result = trips;

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (t) => t.name.toLowerCase().includes(search) || t.destination.toLowerCase().includes(search)
      );
    }

    result = result.filter((t) => {
      const effectiveStatus = getEffectiveStatus(t);
      if (filters.status !== 'all' && effectiveStatus !== filters.status) return false;
      if (filters.difficulty !== 'all' && t.difficulty !== filters.difficulty) return false;
      return true;
    });

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [trips, searchTerm, filters, getEffectiveStatus]);

  const selectedTrip = useMemo(
    () => trips.find((t) => t.id === activeId) || null,
    [activeId, trips]
  );

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
      if (editingTrip) {
        updateTrip(editingTrip.id, formData);
        toast.success(`Поход "${formData.name}" обновлен.`);
      } else {
        const newTrip = addTrip(formData);
        if (newTrip) {
          setActiveId(newTrip.id);
        }
      }
      setShowFormModal(false);
      setEditingTrip(null);
    },
    [editingTrip, addTrip, updateTrip]
  );

  const handleClone = useCallback(
    (tripId: number) => {
      const originalTrip = trips.find((t) => t.id === tripId);
      if (!originalTrip) return;

      const { name, participants: _participants, ...rest } = originalTrip;
      const clonedTripData: TripData = {
        ...rest,
        name: `${name} (копия)`,
        participants: [],
      };
      const newTrip = addTrip(clonedTripData);
      if (newTrip) {
        setActiveId(newTrip.id);
        toast.success(`Поход "${originalTrip.name}" клонирован.`);
      }
    },
    [trips, addTrip]
  );

  const handleExport = useCallback(
    (tripId: number) => {
      const trip = trips.find((t) => t.id === tripId);
      if (trip) {
        exportTripToJson(trip);
      }
    },
    [trips]
  );

  const handleRequestDelete = useCallback((trip: Trip) => {
    setTripToDelete(trip);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (tripToDelete) {
      if (tripToDelete.id === activeId) {
        setActiveId(null);
      }
      deleteTrip(tripToDelete.id);
      setTripToDelete(null);
    }
  }, [tripToDelete, activeId, deleteTrip]);

  const handleCloseModal = useCallback(() => {
    setShowFormModal(false);
    setEditingTrip(null);
  }, []);

  const handleAddParticipant = useCallback(() => {
    if (selectedTrip) {
      setAddParticipantModalOpen(true);
    }
  }, [selectedTrip]);

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((value) => value !== 'all'),
    [filters]
  );

  const toggleFilters = useCallback(() => setShowFilters((prev) => !prev), []);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Походы</h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleFilters}
              variant="secondary"
              size="icon"
              className="relative"
              title={showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
            >
              <Filter className="w-4 h-4" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                  {Object.values(filters).filter((value) => value !== 'all').length}
                </span>
              )}
            </Button>
            <Button onClick={handleAddNew} variant="primary" size="icon" title="Создать поход">
              <MapPinPlus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="mb-4 sm:mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <TripFiltersComponent filters={filters} onFiltersChange={setFilters} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 h-[calc(100vh-200px)] sm:h-[calc(100vh-280px)] lg:h-[calc(100vh-320px)] min-h-[500px] sm:min-h-[600px]">
        <div className="lg:col-span-1">
          <div className="h-full overflow-y-auto pr-1 lg:pr-2 space-y-3 lg:space-y-4 custom-scrollbar">
            {filteredTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                isSelected={activeId === trip.id}
                onSelect={setActiveId}
                onEdit={() => handleEdit(trip)}
                onClone={() => handleClone(trip.id)}
                onDelete={() => handleRequestDelete(trip)}
                onExport={() => handleExport(trip.id)}
              />
            ))}
            {filteredTrips.length === 0 && (
              <div className="text-center py-8 sm:py-12 text-gray-500 dark:text-gray-400">
                <Backpack className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                <h3 className="text-base sm:text-lg font-medium mb-2">Походы не найдены</h3>
                {searchTerm || hasActiveFilters ? (
                  <p className="text-sm">Попробуйте изменить критерии поиска или фильтры.</p>
                ) : (
                  <>
                    <p className="text-sm">Пока что походов нет.</p>
                    <Button onClick={handleAddNew} size="sm" className="mt-3">
                      <MapPinPlus className="w-4 h-4 mr-2" />
                      Создать первый поход
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 hidden lg:block">
          <div className="h-full">
            <TripDetail
              trip={selectedTrip}
              onEdit={() => selectedTrip && handleEdit(selectedTrip)}
              onAddParticipant={handleAddParticipant}
            />
          </div>
        </div>
      </div>

      {activeId !== null && (
        <div className="lg:hidden">
          <Modal
            isOpen={activeId !== null}
            onClose={() => setActiveId(null)}
            title={selectedTrip?.name || 'Детали похода'}
          >
            <TripDetail
              trip={selectedTrip}
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

      <Modal
        isOpen={showFormModal}
        onClose={handleCloseModal}
        title={editingTrip ? 'Редактирование похода' : 'Новый поход'}
      >
        <TripForm trip={editingTrip} onSubmit={handleFormSubmit} onCancel={handleCloseModal} />
      </Modal>

      <ConfirmModal
        isOpen={!!tripToDelete}
        onClose={() => setTripToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Подтверждение удаления"
        variant="danger"
        confirmText="Удалить"
      >
        <p>
          Вы уверены, что хотите удалить поход{' '}
          <span className="font-bold">{tripToDelete?.name}</span>? Это действие нельзя отменить.
        </p>
      </ConfirmModal>

      <AddParticipantsModal
        isOpen={isAddParticipantModalOpen}
        onClose={() => setAddParticipantModalOpen(false)}
        tripId={activeId}
      />
    </div>
  );
};

export default TripsPage;
