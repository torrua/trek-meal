import React from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateTripSummary } from '../../utils';
import useProductStore from '../../stores/useProductStore';
import useParticipantStore from '../../stores/useParticipantStore';
import Button from '../../ui/Button';
const STATUSES = {
  planning: { text: 'Планируется', className: 'bg-yellow-100 text-yellow-800' },
  // ... другие статусы
};

function TripCard({ trip, onDelete }) {
  const navigate = useNavigate();
  const { products } = useProductStore();
  const { participants } = useParticipantStore();

  const summary = calculateTripSummary(trip, products, participants);
  const statusInfo = STATUSES[trip.status] || { text: 'Неизвестно', className: 'bg-gray-100 text-gray-800' };

  return (
    <div className="bg-white border rounded-lg shadow-sm transition-shadow hover:shadow-md">
      <div className="p-4 cursor-pointer" onClick={() => navigate(`/trips/${trip.id}`)}>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-800">{trip.name}</h3>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.className}`}>{statusInfo.text}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-center">
          <div><div className="stat-value">{trip.days || 0}</div><div className="stat-label">дней</div></div>
          <div><div className="stat-value">{trip.participants.length}</div><div className="stat-label">участников</div></div>
          <div><div className="stat-value">{(summary.totalWeight / 1000).toFixed(1)}</div><div className="stat-label">кг еды</div></div>
          <div><div className="stat-value">{summary.averageCaloriesPerPersonPerDay}</div><div className="stat-label">ккал/чел</div></div>
        </div>
      </div>
      <div className="p-3 bg-gray-50 border-t flex justify-end gap-2">
        <Button variant="primary" onClick={() => navigate(`/trips/${trip.id}`)}>Планировать</Button>
        <Button variant="danger" onClick={onDelete}>Удалить</Button>
      </div>
      <style jsx>{`
        .stat-value { @apply text-xl font-bold text-blue-600; }
        .stat-label { @apply text-xs text-gray-500 uppercase; }
      `}</style>
    </div>
  );
}

export default TripCard;