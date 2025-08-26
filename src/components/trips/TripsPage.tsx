// src/components/trips/TripsPage.tsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useTripStore from '../../stores/useTripStore';
import useSearchStore from '../../stores/useSearchStore';
import type { Trip, TripData } from '../../types';

import TripCard from './TripCard';
import TripForm from './TripForm';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import ConfirmModal from '../../ui/ConfirmModal';

function TripsPage() {
  const { trips, addTrip, deleteTrip, updateTrip } = useTripStore();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const { searchTerm } = useSearchStore();

  const filteredTrips = useMemo(() => {
    if (!searchTerm.trim()) {
      return trips;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return trips.filter(
      (trip: Trip) =>
        trip.name.toLowerCase().includes(lowercasedFilter) ||
        trip.destination?.toLowerCase().includes(lowercasedFilter)
    );
  }, [trips, searchTerm]);

  const handleFormSubmit = (formData: TripData) => {
    if (editingTrip) {
      updateTrip(editingTrip.id, formData);
    } else {
      const newTrip = addTrip(formData);
      if (newTrip) {
        navigate(`/trips/${newTrip.id}`);
      }
    }
    setIsModalOpen(false);
    setEditingTrip(null);
  };

  const handleAddNew = () => {
    setEditingTrip(null);
    setIsModalOpen(true);
  };

  const handleEdit = (e: React.MouseEvent, trip: Trip) => {
    e.stopPropagation();
    setEditingTrip(trip);
    setIsModalOpen(true);
  };

  const handleRequestDelete = (e: React.MouseEvent, trip: Trip) => {
    e.stopPropagation();
    setTripToDelete(trip);
  };

  const handleConfirmDelete = () => {
    if (tripToDelete) {
      deleteTrip(tripToDelete.id);
      setTripToDelete(null);
    }
  };

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold text-primary">Управление походами</h2>
        <Button onClick={handleAddNew}>+ Создать поход</Button>
      </header>

      {filteredTrips.length === 0 ? (
        <div className="text-center py-16 px-6 bg-muted rounded-lg">
          <h3 className="text-lg font-medium text-secondary">
            {searchTerm ? 'Походы не найдены' : 'Походов пока нет'}
          </h3>
          <p className="text-muted-foreground mt-2 mb-4">
            {searchTerm
              ? 'Попробуйте изменить поисковый запрос.'
              : 'Начните планирование, создав свой первый поход.'}
          </p>
          {!searchTerm && <Button onClick={handleAddNew}>Создать первый поход</Button>}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrips.map((trip: Trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onEdit={(e) => handleEdit(e, trip)}
              onDelete={(e) => handleRequestDelete(e, trip)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTrip(null);
        }}
        title={editingTrip ? 'Редактировать поход' : 'Создать новый поход'}
      >
        <TripForm
          trip={editingTrip}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingTrip(null);
          }}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!tripToDelete}
        onClose={() => setTripToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Подтверждение удаления"
        variant="danger"
        confirmText="Удалить"
      >
        <p>
          Вы уверены, что хотите удалить поход{' '}
          <span className="font-bold">{tripToDelete?.name}</span>?
        </p>
      </ConfirmModal>
    </div>
  );
}

export default TripsPage;
