import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import useTripStore from '../../stores/useTripStore';

const GENDER_ICONS = { male: '👨', female: '👩' };
const AGE_META = { 
  adult: { text: 'Взрослый', className: 'bg-green-100 text-green-800' },
  child: { text: 'Ребенок', className: 'bg-yellow-100 text-yellow-800' },
};

function ParticipantCard({ participant, onEdit, onDelete }) {
  const { name, gender, age, notes } = participant;
  const ageMeta = AGE_META[age] || {};

  const { trips } = useTripStore();
  const participantTrips = useMemo(() => 
    trips.filter(trip => trip.participants.includes(participant.id)),
    [trips, participant.id]
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col transition-shadow hover:shadow-md">
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>{GENDER_ICONS[gender]}</span>
            {name}
          </h3>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${ageMeta.className}`}>
            {ageMeta.text}
          </span>
        </div>
      </div>
      <div className="p-4 flex-grow space-y-4">
        {notes ? (
          <p className="text-sm text-gray-600 italic">"{notes}"</p>
        ) : (
          <p className="text-sm text-gray-400">Нет заметок</p>
        )}
        
        <div>
          <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Участвует в походах:</h4>
          <div className="space-y-1">
            {participantTrips.length > 0 ? (
              participantTrips.map(trip => (
                <Link 
                  key={trip.id} 
                  to={`/trips/${trip.id}`} 
                  className="block text-sm bg-blue-50 p-1.5 rounded text-blue-800 hover:bg-blue-100 hover:font-medium transition-all"
                >
                  {trip.name}
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-400">Не участвует в походах</p>
            )}
          </div>
        </div>
      </div>
      <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
        <button onClick={onEdit} className="text-sm font-medium text-blue-600 hover:text-blue-800">Редактировать</button>
        <button onClick={onDelete} className="text-sm font-medium text-red-600 hover:text-red-800">Удалить</button>
      </div>
    </div>
  );
}

export default ParticipantCard;