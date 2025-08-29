// src/components/participants/ParticipantsPage.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { Users, UserPlus, Filter, X } from 'lucide-react';
import useParticipantStore from '../../stores/useParticipantStore';
import useSearchStore from '../../stores/useSearchStore';
import useTripStore from '../../stores/useTripStore';
import type { Participant, ParticipantData } from '../../types';

import ParticipantListItem from './ParticipantListItem';
import ParticipantDetail from './ParticipantDetail';
import ParticipantForm from './ParticipantForm';
import ParticipantFiltersComponent, { ParticipantFilters } from './ParticipantFiltersComponent';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import ConfirmModal from '../../ui/ConfirmModal';
import Popover from '../../ui/Popover';

function ParticipantsPage() {
  const { participants, addParticipant, updateParticipant, deleteParticipant, cloneParticipant } =
    useParticipantStore();
  const { searchTerm } = useSearchStore();
  const { trips } = useTripStore();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);
  const [filters, setFilters] = useState<ParticipantFilters>({
    gender: 'all',
    age: 'all',
    experience: 'all',
    hasTrips: 'all',
  });

  const [activeId, setActiveId] = useState<number | null>(null);

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((v) => v !== 'all'),
    [filters]
  );

  const filteredParticipants = useMemo(() => {
    let result = participants;

    // Фильтрация по поисковому запросу
    if (searchTerm.trim()) {
      const lowercasedFilter = searchTerm.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lowercasedFilter) ||
          p.notes?.toLowerCase().includes(lowercasedFilter)
      );
    }

    // Применение фильтров
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

  const handleFiltersChange = useCallback(
    (newFilters: ParticipantFilters) => setFilters(newFilters),
    []
  );

  const handleFiltersReset = useCallback(() => {
    setFilters({ gender: 'all', age: 'all', experience: 'all', hasTrips: 'all' });
  }, []);

  const handleAddNew = useCallback(() => {
    setEditingParticipant(null);
    setIsFormModalOpen(true);
  }, []);

  const handleEditRequest = useCallback((participant: Participant) => {
    setEditingParticipant(participant);
    setIsFormModalOpen(true);
  }, []);

  const handleCloneRequest = useCallback(
    (participantId: number) => {
      cloneParticipant(participantId);
    },
    [cloneParticipant]
  );

  const handleDeleteRequest = useCallback((participant: Participant) => {
    setParticipantToDelete(participant);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (!isLoading) {
      setIsFormModalOpen(false);
      setEditingParticipant(null);
    }
  }, [isLoading]);

  const handleCloseDeleteModal = useCallback(
    () => !isLoading && setParticipantToDelete(null),
    [isLoading]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (participantToDelete) {
      setIsLoading(true);
      try {
        // Сброс активного участника, если он удаляется
        if (activeId === participantToDelete.id) {
          setActiveId(null);
        }

        await deleteParticipant(participantToDelete.id);
        setParticipantToDelete(null);
      } catch (error) {
        console.error('Ошибка при удалении участника:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [participantToDelete, deleteParticipant, activeId]);

  const handleFormSubmit = useCallback(
    async (formData: ParticipantData) => {
      setIsLoading(true);
      try {
        if (editingParticipant) {
          await updateParticipant(editingParticipant.id, formData);
        } else {
          await addParticipant(formData);
        }
        setIsFormModalOpen(false);
        setEditingParticipant(null);
      } catch (error) {
        console.error('Ошибка при сохранении участника:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [editingParticipant, updateParticipant, addParticipant]
  );

  const handleItemClick = (id: number) => {
    setActiveId(id);
  };

  return (
    <div className="flex h-[calc(100vh-180px)]">
      {/* --- MASTER (СПИСОК) --- */}
      <div className="w-full max-w-sm border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-foreground">Участники</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Всего: {participants.length}
            {(searchTerm || hasActiveFilters) && ` • Найдено: ${filteredParticipants.length}`}
          </p>
        </div>

        <div className="p-4 flex gap-2">
          <Popover
            trigger={
              <Button variant="secondary" className="relative w-full h-10">
                <Filter className="h-4 w-4 mr-2" /> Фильтр
                {hasActiveFilters && (
                  <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-primary" />
                )}
              </Button>
            }
          >
            <ParticipantFiltersComponent filters={filters} onFiltersChange={handleFiltersChange} />
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFiltersReset}
                className="w-full mt-4 flex items-center gap-2"
              >
                <X className="h-3 w-3" />
                Сбросить фильтры
              </Button>
            )}
          </Popover>
          <Button onClick={handleAddNew} variant="primary" className="h-10">
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-grow overflow-y-auto px-4 pb-4 space-y-2">
          {filteredParticipants.length > 0 ? (
            filteredParticipants.map((p) => (
              <ParticipantListItem
                key={p.id}
                participant={p}
                isSelected={activeId === p.id}
                onClick={() => handleItemClick(p.id)}
              />
            ))
          ) : (
            <div className="text-center py-10 px-4 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-2" />
              <p className="text-sm">Участники не найдены</p>
            </div>
          )}
        </div>
      </div>

      {/* --- DETAIL (ДЕТАЛИ) --- */}
      <div className="flex-grow">
        <ParticipantDetail
          participantId={activeId}
          onDeselect={() => setActiveId(null)}
          onEditRequest={handleEditRequest}
          onCloneRequest={handleCloneRequest}
          onDeleteRequest={handleDeleteRequest}
        />
      </div>

      {/* Модальное окно для создания/редактирования */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        title={editingParticipant ? 'Редактировать участника' : 'Новый участник'}
      >
        <ParticipantForm
          participant={editingParticipant}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          isLoading={isLoading}
        />
      </Modal>

      {/* Модальное окно подтверждения удаления */}
      <ConfirmModal
        isOpen={!!participantToDelete}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Подтвердите удаление"
        variant="danger"
        confirmText="Удалить"
        isLoading={isLoading}
      >
        <p>
          Вы уверены, что хотите удалить участника{' '}
          <span className="font-semibold text-foreground">
            &quot;{participantToDelete?.name}&quot;
          </span>
          ?
        </p>
      </ConfirmModal>
    </div>
  );
}

export default ParticipantsPage;
