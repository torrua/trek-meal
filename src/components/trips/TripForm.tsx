// src/components/trips/TripForm.tsx

import React, { useState, useEffect } from 'react';
import useParticipantStore from '../../stores/useParticipantStore';
import { handleDateChange } from '../../stores/useTripStore';
import Button from '../../ui/Button';
import type { Trip, TripData, Participant } from '../../types';

// Определяем пропсы компонента
interface TripFormProps {
  onSubmit: (formData: TripData) => void;
  onCancel: () => void;
  trip?: Trip | null; // Поход может быть передан для редактирования
}

// Начальное состояние формы соответствует типу TripData
const INITIAL_STATE: TripData = { 
  name: '', 
  description: '', 
  destination: '', 
  difficulty: 'easy', 
  days: 1, 
  mealsPerDay: 3, 
  participants: [], 
  startDate: '', 
  endDate: '' 
};

const TripForm: React.FC<TripFormProps> = ({ onSubmit, onCancel, trip = null }) => { 
  const { participants } = useParticipantStore();
  // Состояние формы строго типизировано
  const [formData, setFormData] = useState<TripData>(INITIAL_STATE);

  useEffect(() => {
    if (trip) {
      // При редактировании заполняем форму данными из trip
      const tripData: TripData = {
        name: trip.name,
        description: trip.description,
        destination: trip.destination,
        difficulty: trip.difficulty,
        days: trip.days,
        mealsPerDay: trip.mealsPerDay,
        participants: trip.participants,
        startDate: trip.startDate,
        endDate: trip.endDate,
      };
      setFormData(tripData);
    } else {
      setFormData(INITIAL_STATE);
    }
  }, [trip]);

  const handleChange = (field: keyof TripData, value: string | number) => {
    setFormData(prev => handleDateChange(prev, field, value));
  };
  
  const handleParticipantToggle = (id: number) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(id)
        ? prev.participants.filter(pId => pId !== id)
        : [...prev.participants, id]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClassName = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500";
  const labelClassName = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClassName}>Название похода *</label>
          <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required className={inputClassName} />
        </div>
        <div>
          <label className={labelClassName}>Место (регион)</label>
          <input type="text" value={formData.destination} onChange={(e) => handleChange('destination', e.target.value)} placeholder="Например, Кавказ" className={inputClassName} />
        </div>
      </div>
      
      <div>
        <label className={labelClassName}>Описание</label>
        <textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} className={inputClassName}></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClassName}>Сложность</label>
          <select value={formData.difficulty} onChange={(e) => handleChange('difficulty', e.target.value)} className={inputClassName}>
            <option value="easy">Легкий</option>
            <option value="medium">Средний</option>
            <option value="hard">Сложный</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClassName}>Дата начала</label>
          <input type="date" value={formData.startDate} onChange={(e) => handleChange('startDate', e.target.value)} className={inputClassName} />
        </div>
        <div>
          <label className={labelClassName}>Дата окончания</label>
          <input type="date" value={formData.endDate} onChange={(e) => handleChange('endDate', e.target.value)} min={formData.startDate} className={inputClassName} />
        </div>
        <div>
          <label className={labelClassName}>Дней</label>
          <input type="number" min="1" value={formData.days} onChange={(e) => handleChange('days', Number(e.target.value))} className={inputClassName} />
        </div>
      </div>
      
      <div>
        <label className={labelClassName}>Участники</label>
        <div className="max-h-32 overflow-y-auto p-3 border rounded-md space-y-2 bg-gray-50">
          {participants.length > 0 ? participants.map((p: Participant) => (
            <label key={p.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer">
              <input type="checkbox" checked={formData.participants.includes(p.id)} onChange={() => handleParticipantToggle(p.id)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm">{p.name}</span>
            </label>
          )) : <p className="text-sm text-gray-500 text-center py-4">Сначала добавьте участников.</p>}
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="ghost" onClick={onCancel}>Отмена</Button>
        <Button type="submit" variant="primary">{trip ? 'Сохранить изменения' : 'Создать поход'}</Button>
      </div>
    </form>
  );
}

export default TripForm;