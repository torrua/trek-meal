// src/components/trips/TripsPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useTripStore from '../../stores/useTripStore';
import type { Trip, TripData } from '../../types';

import TripCard from './TripCard';
import TripForm from './TripForm';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import ConfirmModal from '../../ui/ConfirmModal';

function TripsPage() {
  const { trips, addTrip, deleteTrip } = useTripStore();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);

  const handleFormSubmit = (formData: TripData) => {
    const newTrip = addTrip(formData);
    setIsModalOpen(false);
    if (newTrip) {
      navigate(`/trips/${newTrip.id}`);
    }
  };
  
  const handleRequestDelete = (trip: Trip) => {
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
        <h2 className="text-2xl font-bold text-gray-800">Управление походами</h2>
        <Button onClick={() => setIsModalOpen(true)}>+ Создать поход</Button>
      </header>

      {trips.length === 0 ? (
        <div className="text-center py-16 px-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700">Походов пока нет</h3>
          <p className="text-gray-500 mt-2 mb-4">Начните планирование, создав свой первый поход.</p>
          <Button onClick={() => setIsModalOpen(true)}>Создать первый поход</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip: Trip) => (
            <TripCard key={trip.id} trip={trip} onDelete={() => handleRequestDelete(trip)} />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Создать новый поход">
        <TripForm onSubmit={handleFormSubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      <ConfirmModal
        isOpen={!!tripToDelete}
        onClose={() => setTripToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Подтверждение удаления"
        variant="danger"
        confirmText="Удалить"
      >
        <p>Вы уверены, что хотите удалить поход <span className="font-bold">"{tripToDelete?.name}"</span>?</p>
        <p className="mt-2 text-sm text-gray-500">Это действие невозможно отменить.</p>
      </ConfirmModal>
    </div>
  );
}

export default TripsPage;