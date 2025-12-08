import { useState, useMemo, useCallback, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import useTripStore from '../stores/useTripStore';
import useSearchStore from '../stores/useSearchStore';
import type { Trip, TripData } from '../types';
import { getEffectiveStatus } from '../utils';
import { toast } from 'react-hot-toast';
import { exportTripToJson } from '../utils/backup';

export interface TripFilters {
  status: 'all' | 'planning' | 'active' | 'completed';
  difficulty: 'all' | 'easy' | 'medium' | 'hard';
}

interface UseTripsManagementOptions {
  enableUrlSync?: boolean;
}

export function useTripsManagement(options: UseTripsManagementOptions = {}) {
  const { enableUrlSync = true } = options;

  const { trips, addTrip, deleteTrip, updateTrip } = useTripStore();
  const { searchTerm } = useSearchStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [filters, setFilters] = useState<TripFilters>({ status: 'all', difficulty: 'all' });
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [isAddParticipantModalOpen, setAddParticipantModalOpen] = useState(false);

  // URL sync
  useEffect(() => {
    if (!enableUrlSync) return;
    const selectedId = searchParams.get('selectedId');
    if (selectedId && trips.some((t) => t.id === Number(selectedId))) {
      flushSync(() => {
        setActiveId(Number(selectedId));
      });
      setSearchParams({}, { replace: true });
    }
  }, [enableUrlSync, searchParams, setSearchParams, trips]);

  const filteredTrips = useMemo(() => {
    let result = trips.map((t) => ({ ...t, effectiveStatus: getEffectiveStatus(t) }));

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(search) ||
          t.destination?.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search)
      );
    }

    result = result.filter((t: Trip & { effectiveStatus: string }) => {
      if (filters.status !== 'all' && t.effectiveStatus !== filters.status) return false;
      if (filters.difficulty !== 'all' && t.difficulty !== filters.difficulty) return false;
      return true;
    });

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [trips, searchTerm, filters]);

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
        } as TripData;
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

  return {
    // state
    activeId,
    filters,
    showFormModal,
    editingTrip,
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
    setShowFormModal,
    setShowFilters,
    setAddParticipantModalOpen,
    setTripToDelete,

    handleAddNew,
    handleEdit,
    handleFormSubmit,
    handleClone,
    handleExport,
    handleRequestDelete,
    handleConfirmDelete,
    handleCloseModal,
    handleAddParticipant,
    handleSelectTrip,
  };
}
