// src/components/participants/ParticipantsPage.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { Users, UserPlus, Filter, X, Check, Trash2 } from 'lucide-react';
import useParticipantStore from '../../stores/useParticipantStore';
import useSearchStore from '../../stores/useSearchStore';
import useTripStore from '../../stores/useTripStore';
import type { Participant, ParticipantData, TripData } from '../../types';

import ParticipantListItem from './ParticipantListItem';
import ParticipantDetail from './ParticipantDetail';
import ParticipantFiltersComponent, { ParticipantFilters } from './ParticipantFiltersComponent';
import SelectTripModal from './SelectTripModal';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import ConfirmModal from '../../ui/ConfirmModal';
import Popover from '../../ui/Popover';
import cn from 'classnames';
import TripForm from '../trips/TripForm';
import { toast } from 'react-hot-toast';

function ParticipantsPage() {
  const { participants, addParticipant, updateParticipant, deleteParticipant, cloneParticipant } =
    useParticipantStore();
  const { searchTerm } = useSearchStore();
  const { trips, addTrip, addParticipantsToTrip } = useTripStore();

  const [isLoading, setIsLoading] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);
  const [participantsToDelete, setParticipantsToDelete] = useState<number[]>([]);
  const [filters, setFilters] = useState<ParticipantFilters>({
    gender: 'all',
    age: 'all',
    experience: 'all',
    hasTrips: 'all',
  });

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSelectTripModalOpen, setIsSelectTripModalOpen] = useState(false);
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);

  const [activeId, setActiveId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [isDirty, setIsDirty] = useState(false);

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

  const handleSelectParticipantCheckbox = useCallback((id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = () => {
    const allIds = filteredParticipants.map((p) => p.id);
    const allSelected = allIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...allIds])]);
    }
  };

  const handleAddParticipantsToTrip = useCallback(
    (tripId: number) => {
      try {
        addParticipantsToTrip(tripId, selectedIds);
        setSelectedIds([]);
        setIsSelectTripModalOpen(false);
        toast.success(`Участники добавлены в поход`);
      } catch (error) {
        toast.error('Ошибка при добавлении участников в поход');
      }
    },
    [addParticipantsToTrip, selectedIds]
  );

  const handleCreateTripWithParticipants = useCallback(
    (tripData: TripData) => {
      try {
        const newTrip = addTrip(tripData);
        if (newTrip) {
          addParticipantsToTrip(newTrip.id, selectedIds);
          toast.success(`Создан новый поход с ${selectedIds.length} участниками`);
        }
        setSelectedIds([]);
        setIsNewTripModalOpen(false);
      } catch (error) {
        toast.error('Ошибка при создании похода');
      }
    },
    [addTrip, addParticipantsToTrip, selectedIds]
  );

  const handleBulkDelete = useCallback(() => {
    setParticipantsToDelete(selectedIds);
  }, [selectedIds]);

  const handleConfirmBulkDelete = useCallback(async () => {
    setIsLoading(true);
    try {
      for (const id of participantsToDelete) {
        await deleteParticipant(id);
      }
      setSelectedIds((prev) => prev.filter((id) => !participantsToDelete.includes(id)));
      setParticipantsToDelete([]);
      if (participantsToDelete.includes(activeId!)) {
        setActiveId(null);
      }
      toast.success(`Удалено участников: ${participantsToDelete.length}`);
    } catch (error) {
      toast.error('Ошибка при удалении участников');
    } finally {
      setIsLoading(false);
    }
  }, [participantsToDelete, deleteParticipant, activeId]);

  const handleFiltersChange = useCallback(
    (newFilters: ParticipantFilters) => setFilters(newFilters),
    []
  );

  const handleFiltersReset = useCallback(() => {
    setFilters({ gender: 'all', age: 'all', experience: 'all', hasTrips: 'all' });
  }, []);

  const handleCloseDeleteModal = useCallback(
    () => !isLoading && setParticipantToDelete(null),
    [isLoading]
  );

  const handleSetEditing = (p: Participant | null) => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        'У вас есть несохраненные изменения. Продолжить без сохранения?'
      );
      if (!confirmLeave) return;
    }

    setIsEditing(!!p || p === null);
    setEditingParticipant(p);
    if (p?.id) {
      setActiveId(p.id);
    } else {
      setActiveId(null);
    }
    setIsDirty(false);
  };

  const handleAddNew = () => {
    handleSetEditing(null);
  };

  const handleDeleteRequest = useCallback((p: Participant) => setParticipantToDelete(p), []);

  const handleCloneRequest = useCallback(
    (id: number) => {
      try {
        cloneParticipant(id);
        toast.success('Участник клонирован');
      } catch (error) {
        toast.error('Ошибка при клонировании участника');
      }
    },
    [cloneParticipant]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (participantToDelete) {
      setIsLoading(true);
      try {
        if (activeId === participantToDelete.id) setActiveId(null);
        if (selectedIds.includes(participantToDelete.id))
          setSelectedIds((ids) => ids.filter((id) => id !== participantToDelete.id));
        await deleteParticipant(participantToDelete.id);
        setParticipantToDelete(null);
        toast.success('Участник удален');
      } catch (error) {
        console.error(error);
        toast.error('Ошибка при удалении участника');
      } finally {
        setIsLoading(false);
      }
    }
  }, [participantToDelete, deleteParticipant, activeId, selectedIds]);

  const handleFormSubmit = useCallback(
    async (formData: ParticipantData) => {
      setIsLoading(true);
      try {
        if (editingParticipant?.id) {
          await updateParticipant(editingParticipant.id, formData);
          toast.success('Участник обновлен');
        } else {
          const newParticipant = await addParticipant(formData);
          toast.success('Участник добавлен');
          if (newParticipant?.id) {
            setActiveId(newParticipant.id);
          }
        }
        setIsEditing(false);
        setEditingParticipant(null);
        setIsDirty(false);
      } catch (error) {
        console.error(error);
        toast.error('Ошибка при сохранении участника');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [editingParticipant, updateParticipant, addParticipant]
  );

  const handleItemClick = (id: number) => {
    if (isEditing && isDirty) {
      const confirmLeave = window.confirm(
        'У вас есть несохраненные изменения. Продолжить без сохранения?'
      );
      if (!confirmLeave) return;
    }
    setActiveId(id);
    if (isEditing) {
      setIsEditing(false);
      setEditingParticipant(null);
      setIsDirty(false);
    }
  };

  const allFilteredSelected =
    filteredParticipants.length > 0 &&
    filteredParticipants.every((p) => selectedIds.includes(p.id));
  const someFilteredSelected = filteredParticipants.some((p) => selectedIds.includes(p.id));

  return (
    <div className="flex h-[calc(100vh-180px)]">
      <div className="w-full max-w-sm border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-foreground">Участники</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Всего: {participants.length}
                {(searchTerm || hasActiveFilters) && ` • Найдено: ${filteredParticipants.length}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Popover
                trigger={
                  <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <Filter className="h-4 w-4" />
                    {hasActiveFilters && (
                      <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-primary" />
                    )}
                  </Button>
                }
              >
                <ParticipantFiltersComponent
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                />
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFiltersReset}
                    className="w-full mt-4 flex items-center gap-2"
                  >
                    <X className="h-3 w-3" />
                    Сбросить
                  </Button>
                )}
              </Popover>
              <Button onClick={handleAddNew} variant="primary" size="icon" className="h-9 w-9">
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Массовое выделение */}
          {filteredParticipants.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someFilteredSelected && !allFilteredSelected;
                  }}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                />
                <span className="text-sm text-muted-foreground">
                  {allFilteredSelected ? 'Снять выделение' : 'Выбрать все'}
                </span>
              </label>
            </div>
          )}
        </div>

        <div className="flex-grow overflow-y-auto px-2 pb-4 space-y-1">
          {filteredParticipants.length > 0 ? (
            filteredParticipants.map((p) => (
              <ParticipantListItem
                key={p.id}
                participant={p}
                isSelected={activeId === p.id}
                isChecked={selectedIds.includes(p.id)}
                onItemClick={() => handleItemClick(p.id)}
                onCheckboxClick={(e) => handleSelectParticipantCheckbox(p.id, e)}
                onEdit={() => handleSetEditing(p)}
                onClone={() => handleCloneRequest(p.id)}
                onDelete={() => handleDeleteRequest(p)}
              />
            ))
          ) : (
            <div className="text-center py-10 px-4 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-2" />
              <p className="text-sm">
                {searchTerm || hasActiveFilters ? 'Участники не найдены' : 'Нет участников'}
              </p>
              {!searchTerm && !hasActiveFilters && (
                <Button onClick={handleAddNew} variant="primary" size="sm" className="mt-3">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Добавить первого участника
                </Button>
              )}
            </div>
          )}
        </div>

        {selectedIds.length > 0 && (
          <div className="flex-shrink-0 p-3 border-t bg-card animate-fade-in">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Check className="h-4 w-4 text-primary" />
                <span>Выбрано: {selectedIds.length}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds([])}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsSelectTripModalOpen(true)}
                className="flex-1"
              >
                В поход
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsNewTripModalOpen(true)}
                className="flex-1"
              >
                Новый поход
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkDelete}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-grow">
        <ParticipantDetail
          participantId={activeId}
          onCloneRequest={cloneParticipant}
          onDeleteRequest={handleDeleteRequest}
          setEditingParticipant={handleSetEditing}
          isEditing={isEditing}
          onFormSubmit={handleFormSubmit}
          onCancelEdit={() => handleSetEditing(null)}
          onDirtyChange={setIsDirty}
        />
      </div>

      <SelectTripModal
        isOpen={isSelectTripModalOpen}
        onClose={() => setIsSelectTripModalOpen(false)}
        onConfirm={handleAddParticipantsToTrip}
        selectedCount={selectedIds.length}
        selectedIds={selectedIds}
      />

      <Modal
        isOpen={isNewTripModalOpen}
        onClose={() => setIsNewTripModalOpen(false)}
        title="Создать новый поход с участниками"
      >
        <TripForm
          onSubmit={handleCreateTripWithParticipants}
          onCancel={() => setIsNewTripModalOpen(false)}
          initialParticipantIds={selectedIds}
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
        <p>
          Вы уверены, что хотите удалить участника{' '}
          <span className="font-semibold text-foreground">
            &quot;{participantToDelete?.name}&quot;
          </span>
          ?
        </p>
      </ConfirmModal>

      <ConfirmModal
        isOpen={participantsToDelete.length > 0}
        onClose={() => setParticipantsToDelete([])}
        onConfirm={handleConfirmBulkDelete}
        title="Массовое удаление"
        variant="danger"
        confirmText={`Удалить ${participantsToDelete.length} участников`}
        isLoading={isLoading}
      >
        <p>
          Вы уверены, что хотите удалить {participantsToDelete.length} участников?{' '}
          <span className="text-sm text-muted-foreground block mt-1">
            Это действие нельзя отменить.
          </span>
        </p>
      </ConfirmModal>
    </div>
  );
}

export default ParticipantsPage;
