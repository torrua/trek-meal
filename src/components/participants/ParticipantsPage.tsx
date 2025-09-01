// src/components/participants/ParticipantsPage.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { Users, UserPlus, Search, X, Filter } from 'lucide-react';
import cn from 'classnames';
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

const ParticipantsPage: React.FC = () => {
  const { participants, addParticipant, updateParticipant, deleteParticipant, cloneParticipant } =
    useParticipantStore();
  const { trips } = useTripStore();
  const { searchTerm, setSearchTerm } = useSearchStore();

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

  const stats = useMemo(
    () => ({
      adults: participants.filter((p) => p.age === 'adult').length,
      children: participants.filter((p) => p.age === 'child').length,
      withTrips: participants.filter((p) => trips.some((trip) => trip.participants.includes(p.id)))
        .length,
      withoutTrips: participants.filter(
        (p) => !trips.some((trip) => trip.participants.includes(p.id))
      ).length,
    }),
    [participants, trips]
  );

  const filteredParticipants = useMemo(() => {
    let result = participants;

    // Поиск
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.notes?.toLowerCase().includes(search) ||
          p.phone?.toLowerCase().includes(search) ||
          p.email?.toLowerCase().includes(search)
      );
    }

    // Фильтры
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
      try {
        if (editingParticipant) {
          updateParticipant(editingParticipant.id, formData);
        } else {
          addParticipant(formData);
        }
        setShowFormModal(false);
        setEditingParticipant(null);
      } catch (error) {
        console.error('Error saving participant:', error);
      }
    },
    [editingParticipant, updateParticipant, addParticipant]
  );

  const handleClone = useCallback(
    (id: number) => {
      try {
        cloneParticipant(id);
      } catch (error) {
        console.error('Error cloning participant:', error);
      }
    },
    [cloneParticipant]
  );

  const handleDelete = useCallback(
    (id: number) => {
      if (
        window.confirm(
          'Вы уверены, что хотите удалить этого участника? Это действие нельзя отменить.'
        )
      ) {
        try {
          if (id === activeId) setActiveId(null);
          deleteParticipant(id);
        } catch (error) {
          console.error('Error deleting participant:', error);
        }
      }
    },
    [activeId, deleteParticipant]
  );

  const handleCloseModal = useCallback(() => {
    setShowFormModal(false);
    setEditingParticipant(null);
  }, []);

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((value) => value !== 'all'),
    [filters]
  );

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, [setSearchTerm]);

  const toggleFilters = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Участники</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Управление базой данных участников походов • {participants.length} участников
            </p>
          </div>
          <Button onClick={handleAddNew} className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Добавить участника
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск участников по имени, телефону, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Очистить поиск"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            onClick={toggleFilters}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-lg border transition-all',
              showFilters || hasActiveFilters
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
            )}
            title={showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Фильтры</span>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {Object.values(filters).filter((value) => value !== 'all').length}
              </span>
            )}
          </button>
        </div>
        {showFilters && (
          <ParticipantFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            stats={stats}
          />
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-320px)] min-h-[600px]">
        {/* Left Panel - Participants List */}
        <div className="lg:col-span-1">
          <div className="h-full overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {filteredParticipants.map((participant) => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                isSelected={activeId === participant.id}
                onSelect={setActiveId}
                onEdit={() => handleEdit(participant)}
                onClone={() => handleClone(participant.id)}
                onDelete={() => handleDelete(participant.id)}
              />
            ))}
            {filteredParticipants.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Участники не найдены</h3>
                {searchTerm || hasActiveFilters ? (
                  <div className="space-y-2">
                    <p className="text-sm">Попробуйте изменить критерии поиска или фильтры</p>
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        Очистить поиск
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm">Пока что участников нет</p>
                    <Button onClick={handleAddNew} size="sm" className="mt-3">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Добавить первого участника
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Participant Detail */}
        <div className="lg:col-span-2">
          <div className="h-full">
            <ParticipantDetail
              participant={selectedParticipant}
              onEdit={() => selectedParticipant && handleEdit(selectedParticipant)}
            />
          </div>
        </div>
      </div>

      {/* Modal */}
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
