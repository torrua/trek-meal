// src/components/participants/ParticipantsPage.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { Users, UserPlus, Grid, List, Filter, X } from 'lucide-react';
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
import Popover from '../../ui/Popover';
import cn from 'classnames';

type ViewMode = 'grid' | 'list';

function ParticipantsPage() {
  const { participants, addParticipant, updateParticipant, deleteParticipant, cloneParticipant } =
    useParticipantStore();
  const { searchTerm } = useSearchStore();
  const { trips } = useTripStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<ParticipantFilters>({
    gender: 'all',
    age: 'all',
    experience: 'all',
    hasTrips: 'all',
  });

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((v) => v !== 'all'),
    [filters]
  );

  const filteredParticipants = useMemo(() => {
    let result = participants;
    if (searchTerm.trim()) {
      const lowercasedFilter = searchTerm.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lowercasedFilter) ||
          p.notes?.toLowerCase().includes(lowercasedFilter)
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

  const handleFiltersChange = useCallback(
    (newFilters: ParticipantFilters) => setFilters(newFilters),
    []
  );
  const handleFiltersReset = useCallback(() => {
    setFilters({ gender: 'all', age: 'all', experience: 'all', hasTrips: 'all' });
  }, []);
  const handleAddNew = useCallback(() => {
    setEditingParticipant(null);
    setIsModalOpen(true);
  }, []);
  const handleEdit = useCallback((p: Participant) => {
    setEditingParticipant(p);
    setIsModalOpen(true);
  }, []);
  const handleClone = useCallback(
    (id: number) => {
      cloneParticipant(id);
    },
    [cloneParticipant]
  );
  const handleDeleteRequest = useCallback((e: React.MouseEvent, p: Participant) => {
    e.stopPropagation();
    setParticipantToDelete(p);
  }, []);
  const handleCloseModal = useCallback(() => !isLoading && setIsModalOpen(false), [isLoading]);
  const handleCloseDeleteModal = useCallback(
    () => !isLoading && setParticipantToDelete(null),
    [isLoading]
  );
  const handleConfirmDelete = useCallback(async () => {
    if (participantToDelete) {
      setIsLoading(true);
      try {
        await deleteParticipant(participantToDelete.id);
        setParticipantToDelete(null);
      } catch (error) {
        console.error(error);
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
        console.error(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [editingParticipant, updateParticipant, addParticipant]
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Управление участниками</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Всего участников: {participants.length}
            {(searchTerm || hasActiveFilters) && ` • Найдено: ${filteredParticipants.length}`}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Popover
            trigger={
              <Button variant="secondary" className="relative">
                <Filter className="h-4 w-4 mr-2" /> Фильтр
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 block h-2 w-2 rounded-full bg-primary" />
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
          <div className="inline-flex rounded-md border bg-card overflow-hidden h-10">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors border-r',
                viewMode === 'grid'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <Grid className="h-4 w-4" />
              Сетка
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors',
                viewMode === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <List className="h-4 w-4" />
              Список
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

      {filteredParticipants.length === 0 ? (
        <div className="text-center py-16 px-6 bg-muted/50 rounded-lg border">
          <div className="max-w-md mx-auto">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm || hasActiveFilters ? 'Участники не найдены' : 'Участников пока нет'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || hasActiveFilters
                ? 'Попробуйте изменить поисковый запрос или сбросить фильтры.'
                : 'Добавьте первого участника, чтобы начать.'}
            </p>
            {!(searchTerm || hasActiveFilters) && (
              <Button onClick={handleAddNew} variant="primary" size="lg">
                <UserPlus className="h-4 w-4 mr-2" />
                Добавить первого участника
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={
            viewMode === 'list'
              ? 'space-y-3'
              : 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'
          }
        >
          {filteredParticipants.map((p) => (
            <ParticipantCard
              key={p.id}
              participant={p}
              onEdit={() => handleEdit(p)}
              onDelete={(e) => handleDeleteRequest(e, p)}
              onClone={() => handleClone(p.id)}
              isCompact={viewMode === 'list'}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
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
          <p>
            Вы уверены, что хотите удалить участника{' '}
            <span className="font-semibold text-foreground">
              &quot;{participantToDelete?.name}&quot;
            </span>
            ?
          </p>
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md flex items-start gap-2">
            <svg
              className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
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
