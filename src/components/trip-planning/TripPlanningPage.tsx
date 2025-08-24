// src/components/trip-planning/TripPlanningPage.tsx

import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select, { SingleValue } from 'react-select';
import useTripStore from '../../stores/useTripStore';
import useProductStore from '../../stores/useProductStore';
import useParticipantStore from '../../stores/useParticipantStore';
import { calculateTripSummary, getMealName, formatDate } from '../../utils';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import TripForm from '../trips/TripForm';
import type { TripData, Product } from '../../types';

type SelectOption = { value: number; label: string };

function TripPlanningPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const numericTripId = tripId ? parseInt(tripId, 10) : undefined;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const trip = useTripStore(state => state.trips.find(t => t.id === numericTripId));
  const updateTrip = useTripStore(state => state.updateTrip);
  const { products } = useProductStore();
  const { participants } = useParticipantStore();

  const summary = useMemo(() => calculateTripSummary(trip, products, participants), [trip, products, participants]);
  
  const productOptions: SelectOption[] = useMemo(() => 
    products.map((p: Product) => ({ value: p.id, label: p.name })), 
    [products]
  );
  
  const availableParticipantsOptions: SelectOption[] = useMemo(() =>
    participants
      .filter(p => !trip?.participants.includes(p.id))
      .map(p => ({ value: p.id, label: p.name })),
    [participants, trip]
  );

  const handleParticipantAdd = (selectedOption: SingleValue<SelectOption>) => {
    if (!trip || !selectedOption) return;
    const participantId = selectedOption.value;
    const updatedParticipants = [...trip.participants, participantId];
    updateTrip(trip.id, { participants: updatedParticipants });
  };

  const handleParticipantRemove = (participantId: number) => {
    if (!trip) return;
    const updatedParticipants = trip.participants.filter(id => id !== participantId);
    updateTrip(trip.id, { participants: updatedParticipants });
  };

  const handleDetailsUpdate = (formData: TripData) => {
    if (!trip) return;
    updateTrip(trip.id, formData);
    setIsEditModalOpen(false);
  };
  
  const handleProductChange = (dayIndex: number, mealIndex: number, productId: number, action: 'add' | 'remove') => {
    if (!trip) return;
    const mealId = `${dayIndex + 1}-${mealIndex + 1}`;
    const newSelectedMeals = JSON.parse(JSON.stringify(trip.selectedMeals || {}));
    
    if (!newSelectedMeals[mealId]) newSelectedMeals[mealId] = [];

    if (action === 'add') {
      const product = products.find(p => p.id === productId);
      if (!product || newSelectedMeals[mealId].some((item: any) => item.productId === productId)) return;
      
      newSelectedMeals[mealId].push({ productId: product.id, weight: product.portions?.[0]?.weight || 0 });
    } else if (action === 'remove') {
      newSelectedMeals[mealId] = newSelectedMeals[mealId].filter((item: any) => item.productId !== productId);
    }
    
    updateTrip(trip.id, { selectedMeals: newSelectedMeals });
  };

  if (!trip) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold">Поход не найден</h2>
        <p className="text-gray-500 my-4">Возможно, он был удален или вы перешли по неверной ссылке.</p>
        <Button onClick={() => navigate('/trips')} className="mt-4">Назад к походам</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{trip.name}</h2>
          <p className="text-sm text-gray-500">{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(true)}>Редактировать</Button>
            <Button variant="ghost" onClick={() => navigate('/trips')}>← К списку походов</Button>
        </div>      
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold">План питания</h3>
          {/* ... (остальной код рендеринга без изменений) */}
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Сводка</h3>
          <div className="p-4 border rounded-lg bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-2 bg-gray-50 rounded"><div className="text-xl font-bold text-blue-600">{summary.tripParticipants.length}</div><div className="text-xs text-gray-500 uppercase">Участников</div></div>
              <div className="text-center p-2 bg-gray-50 rounded"><div className="text-xl font-bold text-blue-600">{(summary.totalWeight / 1000).toFixed(2)}</div><div className="text-xs text-gray-500 uppercase">Кг еды</div></div>
              <div className="text-center p-2 bg-gray-50 rounded"><div className="text-xl font-bold text-blue-600">{summary.averageWeightPerPersonPerDay}</div><div className="text-xs text-gray-500 uppercase">г/чел/день</div></div>
              <div className="text-center p-2 bg-gray-50 rounded"><div className="text-xl font-bold text-blue-600">{summary.averageCaloriesPerPersonPerDay}</div><div className="text-xs text-gray-500 uppercase">ккал/чел/день</div></div>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <h4 className="text-xl font-semibold">Участники ({summary.tripParticipants.length})</h4>
            <Select
                  options={availableParticipantsOptions}
                  onChange={handleParticipantAdd}
                  placeholder="Добавить участника..."
                  value={null}
                  noOptionsMessage={() => 'Все участники уже в походе'}
                />
            <div className="p-4 border rounded-lg bg-white space-y-1">
                  {summary.tripParticipants.length > 0 ? (
                    summary.tripParticipants.map(p => (
                      <div key={p.id} className="flex justify-between items-center text-sm p-1.5 bg-gray-50 rounded">
                        <span>{p.name}</span>
                        <button onClick={() => handleParticipantRemove(p.id)} className="text-red-500 hover:text-red-700 font-bold px-2">&times;</button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">Добавьте участников</p>
                  )}
                </div>
              </div>
        </div>
      </div>
      
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Редактировать поход"
      >
        <TripForm 
          trip={trip}
          onSubmit={handleDetailsUpdate}
          onCancel={() => setIsEditModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}

export default TripPlanningPage;