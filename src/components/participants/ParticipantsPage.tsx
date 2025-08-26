// src/components/participants/ParticipantsPage.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { Users, UserPlus, Download, Upload, Grid3X3, List, Filter } from 'lucide-react';
import useParticipantStore from '../../stores/useParticipantStore';
import useSearchStore from '../../stores/useSearchStore';
// import useTripsStore from '../../stores/useTripsStore'; // Предполагаем, что есть store для походов
import type { Participant, ParticipantData } from '../../types';

import ParticipantCard from './ParticipantCard';
import ParticipantForm from './ParticipantForm';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import ConfirmModal from '../../ui/ConfirmModal';

type ViewMode = 'compact' | 'expanded';
type FilterType = 'all' | 'adults' | 'children' | 'beginner' | 'experienced' | 'professional';

function ParticipantsPage() {
  const { participants, addParticipant, updateParticipant, deleteParticipant } =
    useParticipantStore();
  const { searchTerm } = useSearchStore();
  // const { trips } = useTripsStore(); // Получаем походы

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('expanded');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredParticipants = useMemo(() => {
    let filtered = participants;

    // Фильтрация по поиску
    if (searchTerm.trim()) {
      const lowercasedFilter = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((participant: Participant) => {
        const nameMatch = participant.name.toLowerCase().includes(lowercasedFilter);
        const notesMatch = participant.notes?.toLowerCase().includes(lowercasedFilter);
        const phoneMatch = participant.phone?.toLowerCase().includes(lowercasedFilter);
        const emailMatch = participant.email?.toLowerCase().includes(lowercasedFilter);
        return nameMatch || notesMatch || phoneMatch || emailMatch;
      });
    }

    // Фильтрация по категориям
    if (activeFilter !== 'all') {
      filtered = filtered.filter((participant) => {
        switch (activeFilter) {
          case 'adults':
            return participant.age === 'adult';
          case 'children':
            return participant.age === 'child';
          case 'beginner':
          case 'experienced':
          case 'professional':
            return participant.experienceLevel === activeFilter;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [participants, searchTerm, activeFilter]);

  // Функция для получения походов участника
  const getParticipantTrips = useCallback((participantId: number) => {
    // Здесь должна быть логика получения походов для конкретного участника
    // Пример:
    // return trips.filter(trip => trip.participants.includes(participantId));

    // Временная заглушка для демонстрации
    const mockTrips = [
      { id: '1', name: 'Поход в горы Алтая', date: '15.06.2024' },
      { id: '2', name: 'Байкал - зимнее путешествие' },
      { id: '3', name: 'Кавказские вершины', date: '20.08.2024' },
    ];

    // Возвращаем случайное количество походов для демонстрации
    return mockTrips.slice(0, Math.floor(Math.random() * 4));
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
        throw error;
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

  // Функции для экспорта/импорта
  const handleExportData = useCallback(() => {
    const dataStr = JSON.stringify(participants, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `participants_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [participants]);

  const handleImportData = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedData = JSON.parse(e.target?.result as string);
            console.log('Импорт данных:', importedData);
            // TODO: Реализовать импорт через store
          } catch (error) {
            console.error('Ошибка при импорте:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  const childrenCount = participants.filter((p) => p.age === 'child').length;
  const adultsCount = participants.filter((p) => p.age === 'adult').length;

  const filterOptions = [
    { value: 'all', label: 'Все', count: participants.length },
    { value: 'adults', label: 'Взрослые', count: adultsCount },
    { value: 'children', label: 'Дети', count: childrenCount },
    {
      value: 'beginner',
      label: 'Новички',
      count: participants.filter((p) => p.experienceLevel === 'beginner').length,
    },
    {
      value: 'experienced',
      label: 'Опытные',
      count: participants.filter((p) => p.experienceLevel === 'experienced').length,
    },
    {
      value: 'professional',
      label: 'Профессионалы',
      count: participants.filter((p) => p.experienceLevel === 'professional').length,
    },
  ];

  const gridClasses =
    viewMode === 'compact'
      ? 'grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'
      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex flex-col gap-4 mb-6 pb-4 border-b border-border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Управление участниками</h2>
            <div className="text-sm text-muted-foreground mt-1">
              <p>
                Всего участников: {participants.length}
                {participants.length > 0 && (
                  <span>
                    {' '}
                    • Взрослых: {adultsCount} • Детей: {childrenCount}
                  </span>
                )}
                {searchTerm && ` • Найдено: ${filteredParticipants.length}`}
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            {/* Переключатель видов */}
            <div className="flex rounded-md border border-input bg-background p-1">
              <button
                onClick={() => setViewMode('expanded')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'expanded'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
                title="Развернутый вид"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'compact'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
                title="Компактный вид"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {participants.length > 0 && (
              <>
                <Button
                  onClick={handleExportData}
                  variant="ghost"
                  size="sm"
                  className="whitespace-nowrap flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Экспорт
                </Button>
                <Button
                  onClick={handleImportData}
                  variant="ghost"
                  size="sm"
                  className="whitespace-nowrap flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Импорт
                </Button>
              </>
            )}
            <Button
              onClick={handleAddNew}
              variant="primary"
              className="whitespace-nowrap flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Добавить участника
            </Button>
          </div>
        </div>

        {/* Фильтры */}
        {participants.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Фильтр:</span>
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setActiveFilter(option.value as FilterType)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  activeFilter === option.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-input hover:bg-muted'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        )}
      </header>

      {filteredParticipants.length === 0 ? (
        <div className="text-center py-16 px-6 bg-muted/50 rounded-lg border border-border">
          <div className="max-w-md mx-auto">
            <div className="flex justify-center mb-4">
              <Users className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm || activeFilter !== 'all'
                ? 'Участники не найдены'
                : 'Участников пока нет'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || activeFilter !== 'all'
                ? 'Попробуйте изменить поисковый запрос или очистить фильтры.'
                : 'Добавьте первого участника, чтобы начать планирование походов.'}
            </p>
            {!searchTerm && activeFilter === 'all' && (
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
        <div className={gridClasses}>
          {filteredParticipants.map((participant) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              onEdit={() => handleEdit(participant)}
              onDelete={(e) => handleDeleteRequest(e, participant)}
              participantTrips={getParticipantTrips(participant.id)}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingParticipant ? 'Редактировать участника' : 'Новый участник'}
        size="lg"
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
              &quot;{participantToDelete?.name}&ldquo;
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
