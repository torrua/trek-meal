import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useTripStore from '../../stores/useTripStore';
import TripCard from './TripCard';
import TripForm from './TripForm';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

function TripsPage() {
  const { trips, addTrip, deleteTrip } = useTripStore();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFormSubmit = (formData) => {
    const newTrip = addTrip(formData);
    setIsModalOpen(false);
    if (newTrip) {
      navigate(`/trips/${newTrip.id}`);
    }
  };
  
  const handleDelete = (tripId) => {
      if (window.confirm('Вы уверены, что хотите удалить этот поход?')) {
          deleteTrip(tripId);
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
          {trips.map(trip => (
            <TripCard key={trip.id} trip={trip} onDelete={() => handleDelete(trip.id)} />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Создать новый поход">
        <TripForm onSubmit={handleFormSubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}

export default TripsPage;