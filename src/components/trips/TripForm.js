import React, { useState } from 'react';
import useParticipantStore from '../../stores/useParticipantStore';
import { handleDateChange } from '../../stores/useTripStore';
import Button from '../../ui/Button';

const INITIAL_STATE = { name: '', days: 1, mealsPerDay: 3, participants: [], startDate: '', endDate: '' };

function TripForm({ onSubmit, onCancel }) {
  const { participants } = useParticipantStore();
  const [formData, setFormData] = useState(INITIAL_STATE);

  const handleChange = (field, value) => {
    setFormData(prev => handleDateChange(prev, field, value));
  };
  
  const handleParticipantToggle = (id) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(id)
        ? prev.participants.filter(pId => pId !== id)
        : [...prev.participants, id]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Название похода *</label>
        <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required className="input w-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="label">Дата начала</label>
          <input type="date" value={formData.startDate} onChange={(e) => handleChange('startDate', e.target.value)} className="input w-full" />
        </div>
        <div>
          <label className="label">Дата окончания</label>
          <input type="date" value={formData.endDate} onChange={(e) => handleChange('endDate', e.target.value)} min={formData.startDate} className="input w-full" />
        </div>
        <div>
          <label className="label">Дней</label>
          <input type="number" min="1" value={formData.days} onChange={(e) => handleChange('days', e.target.value)} className="input w-full" />
        </div>
      </div>
      
      <div>
        <label className="label">Участники *</label>
        <div className="max-h-32 overflow-y-auto p-2 border rounded-md space-y-1">
          {participants.length > 0 ? participants.map(p => (
            <label key={p.id} className="flex items-center gap-2 p-1 rounded hover:bg-gray-100">
              <input type="checkbox" checked={formData.participants.includes(p.id)} onChange={() => handleParticipantToggle(p.id)} />
              <span>{p.name}</span>
            </label>
          )) : <p className="text-sm text-gray-500">Сначала добавьте участников.</p>}
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>Отмена</Button>
        <Button type="submit" variant="primary">Создать поход</Button>
      </div>
      <style jsx>{`.input { @apply w-full px-3 py-2 border border-gray-300 rounded-md } .label { @apply block text-sm font-medium text-gray-700 mb-1 }`}</style>
    </form>
  );
}

export default TripForm;