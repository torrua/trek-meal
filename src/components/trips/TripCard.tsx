// src/components/trips/TripCard.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import useProductStore from '../../stores/useProductStore';
import useParticipantStore from '../../stores/useParticipantStore';
import useDishStore from '../../stores/useDishStore';
import { calculateTripSummary } from '../../utils';
import Button from '../../ui/Button';
import type { Trip } from '../../types';

interface TripCardProps {
  trip: Trip;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
    <path
      fillRule="evenodd"
      d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
      clipRule="evenodd"
    />
  </svg>
);

const STATUSES: { [key in Trip['status']]: { text: string; className: string } } = {
  planning: { text: 'Планируется', className: 'bg-yellow-100 text-yellow-800' },
  completed: { text: 'Завершен', className: 'bg-green-100 text-green-800' },
};

const DIFFICULTY_META: { [key in Trip['difficulty']]: { text: string; className: string } } = {
  easy: { text: 'Легкий', className: 'bg-green-100 text-green-800' },
  medium: { text: 'Средний', className: 'bg-yellow-100 text-yellow-800' },
  hard: { text: 'Сложный', className: 'bg-red-100 text-red-800' },
};

const TripCard: React.FC<TripCardProps> = ({ trip, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { products } = useProductStore();
  const { participants } = useParticipantStore();
  const { dishes } = useDishStore();

  const summary = calculateTripSummary(trip, products, participants, dishes);
  const statusInfo = STATUSES[trip.status];
  const difficultyInfo = DIFFICULTY_META[trip.difficulty];

  const statValueClass = 'text-2xl font-bold text-blue-600'; // Акцентный цвет можно оставить
  const statLabelClass = 'text-xs text-muted-foreground uppercase';

  const handleCardClick = () => navigate(`/trips/${trip.id}`);

  return (
    <div className="bg-card text-card-foreground border rounded-lg shadow-sm transition-shadow hover:shadow-md flex flex-col">
      <div className="p-4 border-b border-border/50 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-card-foreground">{trip.name}</h3>
          {trip.destination && (
            <p className="text-sm text-muted-foreground mt-1">📍 {trip.destination}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(e);
            }}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
            title="Редактировать поход"
          >
            <EditIcon />
          </button>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.className}`}>
            {statusInfo.text}
          </span>
          {difficultyInfo && (
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${difficultyInfo.className}`}
            >
              {difficultyInfo.text}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 cursor-pointer flex-grow" onClick={handleCardClick}>
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

      <div className="p-3 bg-muted border-t flex justify-end gap-2">
        <Button variant="secondary" onClick={handleCardClick}>
          Планировать
        </Button>
        <Button
          variant="danger"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(e);
          }}
        >
          Удалить
        </Button>
      </div>
    </div>
  );
};

export default TripCard;
