// src/pages/ParticipantsPage.tsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  UserRoundPlus,
  Filter,
  MapPin,
  Backpack,
  Edit,
  Copy,
  Trash2,
  Share,
  MapPinPlus,
} from 'lucide-react';
import useParticipantStore from '../stores/useParticipantStore';
import useSearchStore from '../stores/useSearchStore';
import useTripStore from '../stores/useTripStore';
import type { Participant, ParticipantData } from '../types';
import ParticipantDetail from '../components/participants/ParticipantDetail';
import ParticipantFiltersComponent, {
  ParticipantFilters,
} from '../components/participants/ParticipantFiltersComponent';
import ParticipantForm from '../components/participants/ParticipantForm';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import EntityCard, { MenuItem } from '../ui/EntityCard';
import { exportParticipantToJson } from '../utils/backup';
import { calculateAge } from '../utils';
import { EXPERIENCE_CONFIG, GENDER_CONFIG } from '../constants/participants';
import SelectTripModal from '../components/participants/SelectTripModal';

const ParticipantsPage: React.FC = () => {
  const store = useParticipantStore();
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
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isSelectTripModalOpen, setSelectTripModalOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(['data', 'trips']);

  const handleToggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  useEffect(() => {
    const selectedId = searchParams.get('selectedId');
    if (selectedId && store.participants.some((p) => p.id === Number(selectedId))) {
      setActiveId(Number(selectedId));
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, store.participants, setSearchParams]);

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

  const handleClone = useCallback((id: number) => store.cloneParticipant(id), [store]);
  const handleRequestDelete = useCallback((p: Participant) => setParticipantToDelete(p), []);
  const handleConfirmDelete = useCallback(() => {
    if (participantToDelete) {
      if (participantToDelete.id === activeId) setActiveId(null);
      store.deleteParticipant(participantToDelete.id);
      setParticipantToDelete(null);
    }
  }, [participantToDelete, activeId, store]);

  const handleAddToTrip = useCallback((participantId?: number) => {
    if (participantId) setActiveId(participantId);
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

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((v) => v !== 'all'),
    [filters]
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Заголовок и кнопки */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Участники</h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowFilters((s) => !s)}
              variant="secondary"
              size="icon"
              className="relative"
              title="Фильтры"
            >
              <Filter className="w-4 h-4" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full border-2 border-card" />
              )}
            </Button>
            <Button onClick={handleAddNew} variant="primary" size="default">
              <UserRoundPlus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Добавить участника</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      {showFilters && (
        <div className="mb-4 sm:mb-6 bg-card rounded-xl border p-3 sm:p-4">
          <ParticipantFiltersComponent filters={filters} onFiltersChange={setFilters} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Список участников */}
        <div className="lg:col-span-1 space-y-3">
          {filteredParticipants.map((p) => {
            const experienceInfo = EXPERIENCE_CONFIG[p.experienceLevel];
            const genderInfo = GENDER_CONFIG[p.gender];
            const age = calculateAge(p.birthDate);
            const tripCount = trips.filter((trip) => trip.participants.includes(p.id)).length;

            const subtitle = age ? `${age} лет` : p.age === 'child' ? 'Ребенок' : 'Взрослый';

            // Use gender color for border (male/female)
            const genderBorderColor = genderInfo.color;

            const details = [
              { icon: MapPin, text: tripCount, title: 'Походы' },
              { icon: Backpack, text: 0, title: 'Снаряжение' },
            ];

            const menuItems: MenuItem[] = [
              { label: 'Редактировать', icon: Edit, onClick: () => handleEdit(p) },
              {
                label: 'Добавить в поход',
                icon: MapPinPlus,
                onClick: () => handleAddToTrip(p.id),
              },
              { label: 'Клонировать', icon: Copy, onClick: () => handleClone(p.id) },
              { label: 'Экспорт', icon: Share, onClick: () => exportParticipantToJson(p) },
              {
                label: 'Удалить',
                icon: Trash2,
                onClick: () => handleRequestDelete(p),
                className:
                  'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50',
              },
            ];

            return (
              <EntityCard
                key={p.id}
                title={p.name}
                subtitle={subtitle}
                icon={experienceInfo.icon}
                iconColor={experienceInfo.colorClassName}
                details={details}
                isSelected={activeId === p.id}
                onSelect={() => setActiveId(p.id)}
                borderColor={genderBorderColor}
                menuItems={menuItems}
              />
            );
          })}
          {filteredParticipants.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Участники не найдены</h3>
              <p>
                {searchTerm || hasActiveFilters
                  ? 'Попробуйте изменить критерии поиска.'
                  : 'Добавьте своего первого участника.'}
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 hidden lg:block sticky top-24 self-start max-h-[calc(100vh-7.5rem)]">
          {selectedParticipant ? (
            <ParticipantDetail
              participant={selectedParticipant}
              onAddToTrip={() => handleAddToTrip()}
              onEdit={() => selectedParticipant && handleEdit(selectedParticipant)}
              openSections={openSections}
              onToggleSection={handleToggleSection}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-4">
                <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Выберите участника</h3>
                <p className="text-muted-foreground">
                  Кликните на карточку для просмотра подробной информации.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Модальные окна */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={editingParticipant ? 'Редактирование участника' : 'Новый участник'}
      >
        <ParticipantForm
          participant={editingParticipant}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowFormModal(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!participantToDelete}
        onClose={() => setParticipantToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Подтверждение"
        variant="danger"
        confirmText="Удалить"
      >
        <p>
          Вы уверены, что хотите удалить участника{' '}
          <span className="font-bold">{participantToDelete?.name}</span>?
        </p>
      </ConfirmModal>

      {activeId && (
        <SelectTripModal
          isOpen={isSelectTripModalOpen}
          onClose={() => setSelectTripModalOpen(false)}
          onConfirm={handleConfirmAddToTrip}
          selectedCount={1}
          selectedIds={[activeId]}
        />
      )}
    </div>
  );
};

export default ParticipantsPage;
