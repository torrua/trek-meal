import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useParticipantStore from '../stores/useParticipantStore';
import useTripStore from '../stores/useTripStore';
import useSearchStore from '../stores/useSearchStore';
import type { Participant, ParticipantData } from '../types';
import type { ParticipantFilters } from '../components/participants/ParticipantFiltersComponent';

interface UseParticipantsManagementOptions {
  enableUrlSync?: boolean;
}

export function useParticipantsManagement(options: UseParticipantsManagementOptions = {}) {
  const { enableUrlSync = true } = options;

  const store = useParticipantStore();
  const { trips } = useTripStore();
  const { searchTerm } = useSearchStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [activeId, setActiveId] = useState<number | null>(null);
  const [filters, setFilters] = useState<ParticipantFilters>({
    gender: 'all',
    age: 'all',
    experience: 'all',
    hasTrips: 'all',
  });
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isSelectTripModalOpen, setSelectTripModalOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(['data', 'trips']);

  // URL sync
  useEffect(() => {
    if (!enableUrlSync) return;
    const selectedId = searchParams.get('selectedId');
    if (selectedId && store.participants.some((p) => p.id === Number(selectedId))) {
      setActiveId(Number(selectedId));
      setSearchParams({}, { replace: true });
    }
  }, [enableUrlSync, searchParams, setSearchParams, store.participants]);

  // Data
  const filteredParticipants = useMemo(() => {
    return store.participants
      .filter((p) => {
        if (searchTerm.trim()) {
          const search = searchTerm.toLowerCase();
          if (
            !p.name.toLowerCase().includes(search) &&
            !p.notes?.toLowerCase().includes(search) &&
            !p.email?.toLowerCase().includes(search) &&
            !p.phone?.toLowerCase().includes(search)
          ) {
            return false;
          }
        }
        if (filters.gender !== 'all' && p.gender !== filters.gender) return false;
        if (filters.age !== 'all' && p.age !== filters.age) return false;
        if (filters.experience !== 'all' && p.experienceLevel !== filters.experience) return false;
        if (filters.hasTrips !== 'all') {
          const hasTrips = trips.some((trip) => trip.participants.includes(p.id));
          if (filters.hasTrips === 'with_trips' && !hasTrips) return false;
          if (filters.hasTrips === 'without_trips' && hasTrips) return false;
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [store.participants, searchTerm, filters, trips]);

  const selectedParticipant = useMemo(
    () => store.participants.find((p) => p.id === activeId) || null,
    [activeId, store.participants]
  );

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((v) => v !== 'all'),
    [filters]
  );

  // Handlers
  const handleToggleSection = useCallback((sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  }, []);

  const handleAddNew = useCallback(() => {
    setEditingParticipant(null);
    setShowFormModal(true);
  }, []);

  const handleEdit = useCallback((p: Participant) => {
    setEditingParticipant(p);
    setShowFormModal(true);
  }, []);

  const handleFormSubmit = useCallback(
    (formData: ParticipantData) => {
      if (editingParticipant) {
        store.updateParticipant(editingParticipant.id, formData);
      } else {
        store.addParticipant(formData);
      }
      setShowFormModal(false);
    },
    [editingParticipant, store]
  );

  const handleClone = useCallback((p: Participant) => store.cloneParticipant(p.id), [store]);

  const handleRequestDelete = useCallback((p: Participant) => setParticipantToDelete(p), []);

  const handleConfirmDelete = useCallback(() => {
    if (participantToDelete) {
      if (participantToDelete.id === activeId) setActiveId(null);
      store.deleteParticipant(participantToDelete.id);
      setParticipantToDelete(null);
    }
  }, [participantToDelete, activeId, store]);

  const handleAddToTrip = useCallback((p: Participant) => {
    setActiveId(p.id);
    setSelectTripModalOpen(true);
  }, []);

  const handleConfirmAddToTrip = useCallback(
    (tripId: number) => {
      if (activeId) {
        useTripStore.getState().addParticipantsToTrip(tripId, [activeId]);
      }
      setSelectTripModalOpen(false);
    },
    [activeId]
  );

  return {
    // state
    activeId,
    filters,
    showFormModal,
    editingParticipant,
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
    setShowFormModal,
    setParticipantToDelete,
    setShowFilters,
    setSelectTripModalOpen,
    setOpenSections,

    handleToggleSection,
    handleAddNew,
    handleEdit,
    handleFormSubmit,
    handleClone,
    handleRequestDelete,
    handleConfirmDelete,
    handleAddToTrip,
    handleConfirmAddToTrip,
  };
}
