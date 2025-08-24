// src/components/trips/TripCard.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateTripSummary } from '../../utils';
import useProductStore from '../../stores/useProductStore';
import useParticipantStore from '../../stores/useParticipantStore';
import Button from '../../ui/Button';
import type { Trip } from '../../types'; 

// Типизируем пропсы компонента
interface TripCardProps {
  trip: Trip;
  onDelete: () => void;
}

const STATUSES: { [key in Trip['status']]: { text: string; className: string } } = {
  planning: { text: 'Планируется', className: 'bg-yellow-100 text-yellow-800' },
  completed: { text: 'Завершен', className: 'bg-green-100 text-green-800' },
};

const DIFFICULTY_META: { [key in Trip['difficulty']]: { text: string; className: string } } = {
  easy: { text: 'Легкий', className: 'bg-green-100 text-green-800' },
  medium: { text: 'Средний', className: 'bg-yellow-100 text-yellow-800' },
  hard: { text: 'Сложный', className: 'bg-red-100 text-red-800' },
};

const TripCard: React.FC<TripCardProps> = ({ trip, onDelete }) => {
  const navigate = useNavigate();
  const { products } = useProductStore();
  const { participants } = useParticipantStore();

  const summary = calculateTripSummary(trip, products, participants);
  const statusInfo = STATUSES[trip.status];
  const difficultyInfo = DIFFICULTY_META[trip.difficulty];

  // Вспомогательные классы для статистики, чтобы не повторять код
  const statValueClass = "text-xl font-bold text-blue-600";
  const statLabelClass = "text-xs text-gray-500 uppercase";

  return (
    <div className="bg-white border rounded-lg shadow-sm transition-shadow hover:shadow-md flex flex-col">
      <div className="p-4 cursor-pointer flex-grow" onClick={() => navigate(`/trips/${trip.id}`)}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{trip.name}</h3>
            {trip.destination && <p className="text-sm text-gray-500 mt-1">📍 {trip.destination}</p>}
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.className}`}>{statusInfo.text}</span>
            {difficultyInfo && <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${difficultyInfo.className}`}>{difficultyInfo.text}</span>}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className={statValueClass}>{trip.days || 0}</div>
            <div className={statLabelClass}>дней</div>
          </div>
          <div>
            <div className={statValueClass}>{trip.participants.length}</div>
            <div className={statLabelClass}>участников</div>
          </div>
          <div>
            <div className={statValueClass}>{(summary.totalWeight / 1000).toFixed(1)}</div>
            <div className={statLabelClass}>кг еды</div>
          </div>
          <div>
            <div className={statValueClass}>{summary.averageCaloriesPerPersonPerDay}</div>
            <div className={statLabelClass}>ккал/чел</div>
          </div>
        </div>
      </div>
      <div className="p-3 bg-gray-50 border-t flex justify-end gap-2">
        <Button variant="primary" onClick={() => navigate(`/trips/${trip.id}`)}>Планировать</Button>
        <Button variant="danger" onClick={onDelete}>Удалить</Button>
      </div>
    </div>
  );
}

export default TripCard;