// src/components/participants/ParticipantsPage.tsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, UserPlus, Filter } from 'lucide-react';
import useParticipantStore from '../../stores/useParticipantStore';
import useSearchStore from '../../stores/useSearchStore';
import useTripStore from '../../stores/useTripStore';
import type { Participant, ParticipantData } from '../../types';
import ParticipantCard from './ParticipantCard';
import ParticipantDetail from './ParticipantDetail';
import ParticipantFiltersComponent, { ParticipantFilters } from './ParticipantFiltersComponent';
import ParticipantForm from './ParticipantForm';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import { exportParticipantToJson } from '../../utils/backup';

const ParticipantsPage: React.FC = () => {
  const { participants, addParticipant, updateParticipant, deleteParticipant, cloneParticipant } =
    useParticipantStore();
  const { trips } = useTripStore();
  const { searchTerm } = useSearchStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [filters, setFilters] = useState<ParticipantFilters>({
    gender: 'all',
    age: 'all',
    experience: 'all',
    hasTrips: 'all',
  });
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const selectedId = searchParams.get('selectedId');
    if (selectedId) {
      const participantExists = participants.some((p) => p.id === Number(selectedId));
      if (participantExists) {
        setActiveId(Number(selectedId));
        // Очищаем search param после использования, чтобы URL был чистым
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, participants, setSearchParams]);

  const filteredParticipants = useMemo(() => {
    let result = participants;

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.notes?.toLowerCase().includes(search) ||
          p.email?.toLowerCase().includes(search) ||
          p.phone?.toLowerCase().includes(search)
      );
    }

    result = result.filter((p) => {
      if (filters.gender !== 'all' && p.gender !== filters.gender) return false;
      if (filters.age !== 'all' && p.age !== filters.age) return false;
      if (filters.experience !== 'all' && p.experienceLevel !== filters.experience) return false;
      if (filters.hasTrips !== 'all') {
        const hasTrips = trips.some((trip) => trip.participants.includes(p.id));
        if (filters.hasTrips === 'with_trips' && !hasTrips) return false;
        if (filters.hasTrips === 'without_trips' && hasTrips) return false;
      }
      return true;
    });

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [participants, searchTerm, filters, trips]);

  const selectedParticipant = useMemo(
    () => participants.find((p) => p.id === activeId) || null,
    [activeId, participants]
  );

  const handleAddNew = useCallback(() => {
    setEditingParticipant(null);
    setShowFormModal(true);
  }, []);

  const handleEdit = useCallback((participant: Participant) => {
    setEditingParticipant(participant);
    setShowFormModal(true);
  }, []);

  const handleFormSubmit = useCallback(
    (formData: ParticipantData) => {
      if (editingParticipant) {
        updateParticipant(editingParticipant.id, formData);
      } else {
        addParticipant(formData);
      }
      setShowFormModal(false);
      setEditingParticipant(null);
    },
    [editingParticipant, addParticipant, updateParticipant]
  );

  const handleClone = useCallback(
    (id: number) => {
      cloneParticipant(id);
    },
    [cloneParticipant]
  );

  const handleDelete = useCallback(
    (id: number) => {
      if (window.confirm('Вы уверены, что хотите удалить этого участника?')) {
        if (id === activeId) setActiveId(null);
        deleteParticipant(id);
      }
    },
    [activeId, deleteParticipant]
  );

  const handleAddToTrip = useCallback((participantId: number) => {
    // TODO: Implement "add to trip" modal logic
    alert(`Добавление участника ID:${participantId} в поход...`);
  }, []);

  const handleAddEquipment = useCallback((participantId: number) => {
    // TODO: Implement equipment functionality
    alert(`Добавление снаряжения для участника ID:${participantId}...`);
  }, []);

  const handleExport = useCallback(
    (participantId: number) => {
      const participant = participants.find((p) => p.id === participantId);
      if (participant) {
        exportParticipantToJson(participant);
      }
    },
    [participants]
  );

  const handleCloseModal = useCallback(() => {
    setShowFormModal(false);
    setEditingParticipant(null);
  }, []);

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((value) => value !== 'all'),
    [filters]
  );

  const toggleFilters = useCallback(() => setShowFilters((prev) => !prev), []);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Участники</h1>
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
            <Button onClick={handleAddNew} variant="primary" size="icon" title="Добавить участника">
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="mb-4 sm:mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <ParticipantFiltersComponent filters={filters} onFiltersChange={setFilters} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 h-[calc(100vh-200px)] sm:h-[calc(100vh-280px)] lg:h-[calc(100vh-320px)] min-h-[500px] sm:min-h-[600px]">
        <div className="lg:col-span-1">
          <div className="h-full overflow-y-auto pr-1 lg:pr-2 space-y-3 lg:space-y-4 custom-scrollbar">
            {filteredParticipants.map((p) => (
              <ParticipantCard
                key={p.id}
                participant={p}
                isSelected={activeId === p.id}
                onSelect={setActiveId}
                onEdit={() => handleEdit(p)}
                onClone={() => handleClone(p.id)}
                onDelete={() => handleDelete(p.id)}
                onAddToTrip={() => handleAddToTrip(p.id)}
                onAddEquipment={() => handleAddEquipment(p.id)}
                onExport={() => handleExport(p.id)}
              />
            ))}

            {filteredParticipants.length === 0 && (
              <div className="text-center py-8 sm:py-12 text-gray-500 dark:text-gray-400">
                <Users className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                <h3 className="text-base sm:text-lg font-medium mb-2">Участники не найдены</h3>
                {searchTerm || hasActiveFilters ? (
                  <p className="text-sm">Попробуйте изменить критерии поиска или фильтры.</p>
                ) : (
                  <>
                    <p className="text-sm">Пока что участников нет.</p>
                    <Button onClick={handleAddNew} size="sm" className="mt-3">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Добавить первого участника
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 hidden lg:block">
          <div className="h-full">
            <ParticipantDetail
              participant={selectedParticipant}
              onAddToTrip={handleAddToTrip}
              onAddEquipment={handleAddEquipment}
              onEdit={() => selectedParticipant && handleEdit(selectedParticipant)}
            />
          </div>
        </div>
      </div>

      {activeId !== null && (
        <div className="lg:hidden">
          <Modal
            isOpen={activeId !== null}
            onClose={() => setActiveId(null)}
            title={selectedParticipant?.name || 'Детали участника'}
          >
            <ParticipantDetail
              participant={selectedParticipant}
              onAddToTrip={handleAddToTrip}
              onAddEquipment={handleAddEquipment}
              onEdit={() => {
                if (selectedParticipant) {
                  handleEdit(selectedParticipant);
                  setActiveId(null);
                }
              }}
            />
          </Modal>
        </div>
      )}

      <Modal
        isOpen={showFormModal}
        onClose={handleCloseModal}
        title={editingParticipant ? 'Редактирование участника' : 'Новый участник'}
      >
        <ParticipantForm
          participant={editingParticipant}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default ParticipantsPage;
