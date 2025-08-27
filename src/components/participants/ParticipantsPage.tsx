// src/components/participants/ParticipantsPage.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { Users, UserPlus, Grid, List } from 'lucide-react';
import useParticipantStore from '../../stores/useParticipantStore';
import useSearchStore from '../../stores/useSearchStore';
import useTripStore from '../../stores/useTripStore';
import type { Participant, ParticipantData } from '../../types';

import ParticipantCard from './ParticipantCard';
import ParticipantForm from './ParticipantForm';
import ParticipantFiltersComponent, { ParticipantFilters } from './ParticipantFilters';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import ConfirmModal from '../../ui/ConfirmModal';

function ParticipantsPage() {
  const { participants, addParticipant, updateParticipant, deleteParticipant } =
    useParticipantStore();
  const { searchTerm } = useSearchStore();
  const { trips } = useTripStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);
  const [isCompactView, setIsCompactView] = useState(false);

  // Состояние фильтров
  const [filters, setFilters] = useState<ParticipantFilters>({
    gender: 'all',
    age: 'all',
    experience: 'all',
    hasTrips: 'all',
  });

  const filteredParticipants = useMemo(() => {
    let result = participants;

    // Поиск по имени и заметкам
    if (searchTerm.trim()) {
      const lowercasedFilter = searchTerm.toLowerCase().trim();
      result = result.filter((participant: Participant) => {
        const nameMatch = participant.name.toLowerCase().includes(lowercasedFilter);
        const notesMatch = participant.notes?.toLowerCase().includes(lowercasedFilter);
        return nameMatch || notesMatch;
      });
    }

    // Применяем фильтры
    result = result.filter((participant: Participant) => {
      // Фильтр по полу
      if (filters.gender !== 'all' && participant.gender !== filters.gender) {
        return false;
      }

      // Фильтр по возрасту
      if (filters.age !== 'all' && participant.age !== filters.age) {
        return false;
      }

      // Фильтр по опыту
      if (filters.experience !== 'all' && participant.experienceLevel !== filters.experience) {
        return false;
      }

      // Фильтр по участию в походах
      if (filters.hasTrips !== 'all') {
        const hasTrips = trips.some((trip) => trip.participants.includes(participant.id));
        if (filters.hasTrips === 'with_trips' && !hasTrips) {
          return false;
        }
        if (filters.hasTrips === 'without_trips' && hasTrips) {
          return false;
        }
      }

      return true;
    });

    return result;
  }, [participants, searchTerm, filters, trips]);

  const handleFiltersChange = useCallback((newFilters: ParticipantFilters) => {
    setFilters(newFilters);
  }, []);

  const handleFiltersReset = useCallback(() => {
    setFilters({
      gender: 'all',
      age: 'all',
      experience: 'all',
      hasTrips: 'all',
    });
  }, []);

  const handleAddNew = useCallback(() => {
    setEditingParticipant(null);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((participant: Participant) => {
    setEditingParticipant(participant);
    setIsModalOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((e: React.MouseEvent, participant: Participant) => {
    e.stopPropagation();
    setParticipantToDelete(participant);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (participantToDelete) {
      setIsLoading(true);
      try {
        await deleteParticipant(participantToDelete.id);
        setParticipantToDelete(null);
      } catch (error) {
        console.error('Ошибка при удалении участника:', error);
        // Здесь можно добавить toast уведомление об ошибке
      } finally {
        setIsLoading(false);
      }
    }
  }, [participantToDelete, deleteParticipant]);

  const handleFormSubmit = useCallback(
    async (formData: ParticipantData) => {
      setIsLoading(true);
      try {
        if (editingParticipant) {
          await updateParticipant(editingParticipant.id, formData);
        } else {
          await addParticipant(formData);
        }
        setIsModalOpen(false);
      } catch (error) {
        console.error('Ошибка при сохранении участника:', error);
        // Здесь можно добавить toast уведомление об ошибке
        throw error; // Пробрасываем ошибку в форму
      } finally {
        setIsLoading(false);
      }
    },
    [editingParticipant, updateParticipant, addParticipant]
  );

  const handleCloseModal = useCallback(() => {
    if (!isLoading) {
      setIsModalOpen(false);
    }
  }, [isLoading]);

  const handleCloseDeleteModal = useCallback(() => {
    if (!isLoading) {
      setParticipantToDelete(null);
    }
  }, [isLoading]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-border">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Управление участниками</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Всего участников: {participants.length}
            {(searchTerm || Object.values(filters).some((v) => v !== 'all')) &&
              ` • Найдено: ${filteredParticipants.length}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Переключатель вида */}
          <div className="flex items-center border border-border rounded-md">
            <button
              onClick={() => setIsCompactView(false)}
              className={`p-2 transition-colors ${
                !isCompactView
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title="Карточный вид"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsCompactView(true)}
              className={`p-2 transition-colors ${
                isCompactView
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title="Компактный вид"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Button
            onClick={handleAddNew}
            variant="primary"
            className="whitespace-nowrap flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Добавить участника
          </Button>
        </div>
      </header>

      {/* Фильтры */}
      <ParticipantFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleFiltersReset}
      />

      {filteredParticipants.length === 0 ? (
        <div className="text-center py-16 px-6 bg-muted/50 rounded-lg border border-border">
          <div className="max-w-md mx-auto">
            <div className="flex justify-center mb-4">
              <Users className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm || Object.values(filters).some((v) => v !== 'all')
                ? 'Участники не найдены'
                : 'Участников пока нет'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || Object.values(filters).some((v) => v !== 'all')
                ? 'Попробуйте изменить поисковый запрос или сбросить фильтры.'
                : 'Добавьте первого участника, чтобы начать планирование походов.'}
            </p>
            {!searchTerm && !Object.values(filters).some((v) => v !== 'all') && (
              <Button
                onClick={handleAddNew}
                variant="primary"
                size="lg"
                className="flex items-center gap-2 mx-auto"
              >
                <UserPlus className="h-4 w-4" />
                Добавить первого участника
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={
            isCompactView
              ? 'space-y-3'
              : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          }
        >
          {filteredParticipants.map((participant) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              onEdit={() => handleEdit(participant)}
              onDelete={(e) => handleDeleteRequest(e, participant)}
              isCompact={isCompactView}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingParticipant ? 'Редактировать участника' : 'Новый участник'}
        size="md"
      >
        <ParticipantForm
          participant={editingParticipant}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          isLoading={isLoading}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!participantToDelete}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Подтвердите удаление"
        variant="danger"
        confirmText="Удалить"
        isLoading={isLoading}
      >
        <div className="space-y-3">
          <p className="text-foreground">
            Вы уверены, что хотите удалить участника{' '}
            <span className="font-semibold text-foreground">
              &quot;{participantToDelete?.name}&quot;
            </span>
            ?
          </p>
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5">
              <svg
                className="h-4 w-4 text-orange-600 dark:text-orange-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-sm text-orange-800 dark:text-orange-200">
              Это действие также удалит его из всех походов и не может быть отменено.
            </p>
          </div>
        </div>
      </ConfirmModal>
    </div>
  );
}

export default ParticipantsPage;
